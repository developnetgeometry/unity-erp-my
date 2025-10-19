import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { InvoiceMatchingProps } from '@/types/invoice-matching';
import { ThreeWayComparisonTable } from './three-way-comparison-table';
import { MobileInvoiceReview } from './mobile-invoice-review';
import { useIsMobile } from '@/hooks/use-mobile';
import { Check, X, Clock, MessageSquare, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function InvoiceMatchingView({
  data,
  onApprove,
  onReject,
  onHold,
  onRequestClarification,
}: InvoiceMatchingProps) {
  const isMobile = useIsMobile();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [showHoldSheet, setShowHoldSheet] = useState(false);
  const [showClarificationSheet, setShowClarificationSheet] = useState(false);
  const [justification, setJustification] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');

  const handleApprove = () => {
    if (!data.withinTolerance && !justification.trim()) {
      return;
    }
    onApprove(data.invoice.id, justification || undefined);
    setShowApprovalDialog(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(data.invoice.id, rejectReason);
    setShowRejectSheet(false);
  };

  const handleHold = () => {
    if (!holdReason.trim()) return;
    onHold(data.invoice.id, holdReason);
    setShowHoldSheet(false);
  };

  const handleClarification = () => {
    if (!clarificationMessage.trim()) return;
    onRequestClarification(data.invoice.id, clarificationMessage);
    setShowClarificationSheet(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  // Mobile View
  if (isMobile) {
    return (
      <>
        <MobileInvoiceReview
          data={data}
          onApprove={() => setShowApprovalDialog(true)}
          onReject={() => setShowRejectSheet(true)}
          onHold={() => setShowHoldSheet(true)}
        />

        {/* Approval Dialog */}
        <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Invoice Payment?</AlertDialogTitle>
              <AlertDialogDescription>
                Invoice: {data.invoice.invoiceNumber} - {formatCurrency(data.invoice.total)}
                {!data.withinTolerance && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm">
                    ⚠️ This invoice exceeds tolerance limits and requires justification.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {!data.withinTolerance && (
              <div className="space-y-2">
                <Label htmlFor="justification">Justification (Required)</Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why this variance is acceptable..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={!data.withinTolerance && !justification.trim()}
              >
                Approve Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject/Hold Sheets - Reuse existing patterns from approval-card */}
        <Sheet open={showRejectSheet} onOpenChange={setShowRejectSheet}>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>Reject Invoice</SheetTitle>
              <SheetDescription>Provide reason for rejection</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                variant="destructive"
                className="w-full"
              >
                Confirm Rejection
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={showHoldSheet} onOpenChange={setShowHoldSheet}>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>Hold for Review</SheetTitle>
              <SheetDescription>Why is this invoice being held?</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Textarea
                placeholder="Enter reason for hold..."
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleHold}
                disabled={!holdReason.trim()}
                className="w-full"
              >
                Hold Invoice
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop View
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Three-Way Invoice Matching</CardTitle>
                <CardDescription className="mt-2">
                  Invoice: {data.invoice.invoiceNumber} | Supplier: {data.invoice.supplier} | Due: {data.invoice.dueDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                </CardDescription>
              </div>
              {data.invoice.pdfUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(data.invoice.pdfUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View PDF
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Comparison Table */}
        <ThreeWayComparisonTable data={data} />

        {/* Action Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-1.5 flex-wrap">
                <Button
                  onClick={() => setShowApprovalDialog(true)}
                  disabled={!data.withinTolerance}
                  size="sm"
                  className="gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Approve
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Alt+A
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowHoldSheet(true)}
                  size="sm"
                  className="gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  Hold
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Alt+H
                  </Badge>
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setShowRejectSheet(true)}
                  size="sm"
                  className="gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Reject
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Alt+R
                  </Badge>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowClarificationSheet(true)}
                  size="sm"
                  className="gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Clarify
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Ctrl+M
                  </Badge>
                </Button>
              </div>

              {!data.withinTolerance && (
                <Alert variant="default" className="border-amber-200 bg-amber-50 flex-shrink-0">
                  <AlertDescription className="flex items-center gap-2 text-amber-900">
                    <Clock className="w-4 h-4" />
                    Requires override with justification
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Dialogs */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Invoice Payment</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve payment of {formatCurrency(data.invoice.total)} to {data.invoice.supplier}.
              {!data.withinTolerance && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-amber-900 font-medium">⚠️ Variance exceeds tolerance</p>
                  <p className="text-amber-800 text-sm mt-1">This invoice requires override approval with justification.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!data.withinTolerance && (
            <div className="space-y-2 py-4">
              <Label htmlFor="desktop-justification">Justification (Required)</Label>
              <Textarea
                id="desktop-justification"
                placeholder="Explain why this variance is acceptable and should be approved..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={!data.withinTolerance && !justification.trim()}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Other desktop sheets similar to mobile */}
      <Sheet open={showRejectSheet} onOpenChange={setShowRejectSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Reject Invoice</SheetTitle>
            <SheetDescription>Provide reason for rejection</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              variant="destructive"
              className="w-full"
            >
              Confirm Rejection
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showHoldSheet} onOpenChange={setShowHoldSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Hold for Review</SheetTitle>
            <SheetDescription>Why is this invoice being held?</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <Textarea
              placeholder="Enter reason for hold..."
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleHold}
              disabled={!holdReason.trim()}
              className="w-full"
            >
              Hold Invoice
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showClarificationSheet} onOpenChange={setShowClarificationSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Request Clarification</SheetTitle>
            <SheetDescription>Message procurement or warehouse</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <Textarea
              placeholder="What clarification do you need..."
              value={clarificationMessage}
              onChange={(e) => setClarificationMessage(e.target.value)}
              rows={6}
            />
            <Button
              onClick={handleClarification}
              disabled={!clarificationMessage.trim()}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
