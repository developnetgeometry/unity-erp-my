import { LeaveRequestData } from '@/types/leave-request';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays, addBusinessDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Step4Props {
  data: Partial<LeaveRequestData>;
  employeeName: string;
  employeeAvatar: string;
  approverName: string;
  balance: number;
}

export function Step4Review({ data, employeeName, employeeAvatar, approverName, balance }: Step4Props) {
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual':
        return 'Annual Leave';
      case 'sick':
        return 'Sick Leave';
      case 'emergency':
        return 'Emergency Leave';
      default:
        return type;
    }
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'full':
        return 'Full Day';
      case 'morning':
        return 'Morning Half (9 AM - 1 PM)';
      case 'afternoon':
        return 'Afternoon Half (2 PM - 6 PM)';
      default:
        return duration;
    }
  };

  const daysRequested = data.startDate && data.endDate ? differenceInDays(data.endDate, data.startDate) + 1 : 0;
  const balanceAfter = balance - daysRequested;
  const expectedDecisionDate = addBusinessDays(new Date(), 3); // 3 business days SLA

  // Validation checks
  const hasBalance = balanceAfter >= 0;
  const hasAdvanceNotice = data.startDate ? differenceInDays(data.startDate, new Date()) >= 7 : false;
  const hasAllData = data.leaveType && data.startDate && data.endDate && data.duration;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Review & Submit</h2>
        <p className="text-muted-foreground">Review your leave request before submitting</p>
      </div>

      {/* Employee Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Request Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={employeeAvatar} />
              <AvatarFallback>{employeeName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{employeeName}</p>
              <Badge variant="outline">{data.leaveType && getLeaveTypeLabel(data.leaveType)}</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Dates</p>
                <p className="text-sm text-muted-foreground">
                  {data.startDate && data.endDate
                    ? `${format(data.startDate, 'dd MMM yyyy')} - ${format(data.endDate, 'dd MMM yyyy')} (${daysRequested} ${
                        daysRequested === 1 ? 'day' : 'days'
                      })`
                    : 'Not selected'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{data.duration && getDurationLabel(data.duration)}</p>
              </div>
            </div>

            {data.coverageDelegate && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Coverage Delegate</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={data.coverageDelegate.avatar} />
                      <AvatarFallback>{data.coverageDelegate.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">{data.coverageDelegate.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Balance & Approval Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Balance After</p>
            <p className={`text-2xl font-bold ${balanceAfter < 0 ? 'text-destructive' : 'text-foreground'}`}>{balanceAfter} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Expected Decision</p>
            <p className="text-lg font-semibold">{format(expectedDecisionDate, 'dd MMM')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Approver */}
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-2">Approver</p>
          <p className="text-lg font-semibold">{approverName}</p>
        </CardContent>
      </Card>

      {/* Validation Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment Act Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            {hasBalance ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            <span className={`text-sm ${hasBalance ? 'text-foreground' : 'text-destructive'}`}>Balance sufficient</span>
          </div>

          <div className="flex items-center gap-2">
            {hasAdvanceNotice ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <span className={`text-sm ${hasAdvanceNotice ? 'text-foreground' : 'text-amber-600'}`}>
              {hasAdvanceNotice ? 'Advance notice met' : 'Short notice - Manager discretion'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm">No overlapping requests</span>
          </div>
        </CardContent>
      </Card>

      {!hasAllData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please complete all required fields before submitting.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
