import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ApprovalCardProps } from '@/types/approval-card';
import {
  Check,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  AlertCircle,
  Clock,
  Undo2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function ApprovalCard({ data, onApprove, onReject, onRequestInfo }: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [undoCountdown, setUndoCountdown] = useState(30);
  const [showUndo, setShowUndo] = useState(false);

  const holdIntervalRef = useRef<NodeJS.Timeout>();
  const undoTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short' }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  };

  const handleTouchStart = () => {
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          setShowConfirmDialog(true);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleTouchEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
    }
  };

  const handleConfirmApproval = () => {
    setShowConfirmDialog(false);
    setApprovalStatus('approved');
    setShowUndo(true);
    setUndoCountdown(30);

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowUndo(false);
          onApprove(data.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUndo = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setApprovalStatus('pending');
    setShowUndo(false);
    setUndoCountdown(30);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    setApprovalStatus('rejected');
    setShowRejectSheet(false);
    onReject(data.id, rejectReason);
  };

  const predefinedReasons = [
    'Team coverage conflict',
    'Short notice',
    'Blackout period',
    'Budget constraints',
    'Insufficient documentation',
  ];

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const renderTypeIcon = () => {
    if (data.type === 'leave') return '🏖️';
    if (data.type === 'expense') return '💰';
    return '📄';
  };

  const renderDetails = () => {
    if (data.type === 'leave' && data.details.dates) {
      const start = formatDate(data.details.dates.start);
      const end = formatDate(data.details.dates.end);
      const days = Math.ceil(
        (data.details.dates.end.getTime() - data.details.dates.start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      return `${start} - ${end} (${days} ${days === 1 ? 'day' : 'days'})`;
    }
    if (data.details.amount) {
      return formatCurrency(data.details.amount);
    }
    return data.details.category || '';
  };

  return (
    <>
      <Card className="w-full transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.employee.avatar} alt={data.employee.name} />
              <AvatarFallback>{data.employee.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{renderTypeIcon()}</span>
                <span className="font-semibold capitalize">{data.type} Request</span>
                {data.context.urgent && (
                  <Badge variant="destructive" className="ml-auto">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{data.employee.name}</p>
              <p className="text-lg font-bold mt-1">{renderDetails()}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Context Chips */}
          <div className="flex flex-wrap gap-2">
            {data.context.balanceAfter !== undefined && (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="w-3 h-3" />
                Balance: {data.context.balanceAfter} days after
              </Badge>
            )}

            {data.context.teamOut !== undefined && (
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                Team: {data.context.teamOut} teammates out
              </Badge>
            )}

            {data.context.projectImpact && (
              <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700">
                <AlertCircle className="w-3 h-3" />
                Billable: {data.context.projectImpact.hours}hrs at risk (
                {formatCurrency(data.context.projectImpact.revenue)})
              </Badge>
            )}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <Tabs defaultValue="history" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
                <TabsTrigger value="policy">Policy</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-2 mt-3">
                {data.history && data.history.length > 0 ? (
                  data.history.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 rounded bg-muted">
                      <span>
                        {item.type} - {item.status}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent history</p>
                )}
              </TabsContent>

              <TabsContent value="impact" className="space-y-2 mt-3">
                {data.context.projectImpact ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Project:</strong> {data.context.projectImpact.project}
                    </p>
                    <p>
                      <strong>Hours at risk:</strong> {data.context.projectImpact.hours}hrs (
                      {formatCurrency(data.context.projectImpact.revenue)} billable)
                    </p>
                    {data.context.projectImpact.replacement && (
                      <p className="text-primary">
                        <strong>Suggested replacement:</strong>{' '}
                        {data.context.projectImpact.replacement.name} (
                        {data.context.projectImpact.replacement.availability})
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No project impact</p>
                )}
              </TabsContent>

              <TabsContent value="policy" className="text-sm mt-3">
                <p className="text-muted-foreground">
                  {data.policy || 'Standard company policy applies.'}
                </p>
              </TabsContent>
            </Tabs>
          )}

          {/* Status Display */}
          {approvalStatus === 'approved' && showUndo && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Approved</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  className="gap-1"
                >
                  <Undo2 className="w-3 h-3" />
                  Undo ({undoCountdown}s)
                </Button>
              </div>
              <Progress value={(undoCountdown / 30) * 100} className="h-1" />
            </div>
          )}

          {approvalStatus === 'rejected' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <X className="w-5 h-5" />
                <span className="font-semibold">Rejected</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {approvalStatus === 'pending' && (
            <div className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <Button
                  className="w-full relative overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleTouchStart}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                >
                  {holdProgress > 0 && (
                    <div
                      className="absolute inset-0 bg-primary/20 transition-all"
                      style={{ width: `${holdProgress}%` }}
                    />
                  )}
                  <Check className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">
                    {holdProgress > 0 ? `Hold... ${Math.floor(holdProgress / 10)}/10` : 'Approve'}
                  </span>
                </Button>
              </div>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowRejectSheet(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onRequestInfo(data.id)}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Approve {data.type} request for {data.employee.name}?
              <br />
              <strong>{renderDetails()}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmApproval}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Sheet */}
      <Sheet open={showRejectSheet} onOpenChange={setShowRejectSheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Reject Request</SheetTitle>
            <SheetDescription>
              Please select or provide a reason for rejection
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick reasons:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedReasons.map((reason) => (
                  <Badge
                    key={reason}
                    variant={rejectReason === reason ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setRejectReason(reason)}
                  >
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Custom reason:</p>
              <Textarea
                placeholder="Enter custom reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Preview notification:</p>
              <p className="text-muted-foreground">
                Your {data.type} request has been rejected. Reason: {rejectReason || '(none provided)'}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
            >
              Confirm & Send Rejection
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
