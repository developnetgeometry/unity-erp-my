import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, XCircle, FileText, Clock, User, Briefcase, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CorrectionReviewCardProps {
  correction: {
    id: string;
    employee_id: string;
    attendance_record_id: string;
    correction_type: string;
    requested_clock_in?: string;
    requested_clock_out?: string;
    reason: string;
    attachment_url?: string;
    status: string;
    submission_deadline?: string;
    is_within_deadline: boolean;
    employees: {
      full_name: string;
      position: string;
      departments?: { name: string };
    };
    attendance_records?: {
      clock_in_time?: string;
      clock_out_time?: string;
      attendance_date: string;
    };
  };
  onApprove: (reviewerNotes?: string) => void;
  onReject: (reviewerNotes: string) => void;
}

export function CorrectionReviewCard({ correction, onApprove, onReject }: CorrectionReviewCardProps) {
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    onApprove(reviewerNotes || undefined);
  };

  const handleReject = () => {
    if (!reviewerNotes.trim()) {
      alert('Rejection reason is required');
      return;
    }
    onReject(reviewerNotes);
  };

  const getCorrectionTypeLabel = (type: string) => {
    switch (type) {
      case 'clock_in': return 'Clock-In Only';
      case 'clock_out': return 'Clock-Out Only';
      case 'both': return 'Both Times';
      case 'full_record': return 'Full Record';
      default: return type;
    }
  };

  return (
    <Card className={!correction.is_within_deadline ? 'border-orange-500' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {correction.employees.full_name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {correction.employees.position}
              </span>
              {correction.employees.departments && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {correction.employees.departments.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={correction.is_within_deadline ? 'default' : 'destructive'}>
              {correction.is_within_deadline ? 'Within Deadline' : 'Expired'}
            </Badge>
            <Badge variant="outline">{getCorrectionTypeLabel(correction.correction_type)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deadline Warning */}
        {!correction.is_within_deadline && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This correction was submitted after the 24-hour deadline
            </AlertDescription>
          </Alert>
        )}

        {/* Attendance Date */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Attendance Date:</span>
          <span>{format(new Date(correction.attendance_records?.attendance_date || ''), 'MMMM d, yyyy')}</span>
        </div>

        {/* Time Comparison Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Time</th>
                <th className="text-left p-3 font-medium">Original</th>
                <th className="text-left p-3 font-medium">Requested</th>
              </tr>
            </thead>
            <tbody>
              {(correction.correction_type === 'clock_in' || correction.correction_type === 'both' || correction.correction_type === 'full_record') && (
                <tr className="border-t">
                  <td className="p-3 font-medium">Clock-In</td>
                  <td className="p-3">
                    {correction.attendance_records?.clock_in_time 
                      ? format(new Date(correction.attendance_records.clock_in_time), 'h:mm a')
                      : <span className="text-muted-foreground">Not recorded</span>
                    }
                  </td>
                  <td className="p-3 font-medium text-primary">
                    {correction.requested_clock_in 
                      ? format(new Date(correction.requested_clock_in), 'h:mm a')
                      : '-'
                    }
                  </td>
                </tr>
              )}
              {(correction.correction_type === 'clock_out' || correction.correction_type === 'both' || correction.correction_type === 'full_record') && (
                <tr className="border-t">
                  <td className="p-3 font-medium">Clock-Out</td>
                  <td className="p-3">
                    {correction.attendance_records?.clock_out_time 
                      ? format(new Date(correction.attendance_records.clock_out_time), 'h:mm a')
                      : <span className="text-muted-foreground">Not recorded</span>
                    }
                  </td>
                  <td className="p-3 font-medium text-primary">
                    {correction.requested_clock_out 
                      ? format(new Date(correction.requested_clock_out), 'h:mm a')
                      : '-'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reason */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="font-medium">Reason for Correction</span>
              <span className="text-xs text-muted-foreground">{isExpanded ? 'Hide' : 'Show'}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              {correction.reason}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Attachment */}
        {correction.attachment_url && (
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href={correction.attachment_url} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2" />
              View Supporting Document
            </a>
          </Button>
        )}

        {/* Reviewer Notes */}
        {correction.status === 'pending' && (
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="reviewer-notes">
              Reviewer Notes {!isApproving && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="reviewer-notes"
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder={isApproving ? "Optional notes..." : "Required: Explain reason for rejection..."}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {isApproving ? 'Optional for approval' : 'Required for rejection'}
            </p>
          </div>
        )}

        {/* Actions */}
        {correction.status === 'pending' && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => {
                setIsApproving(true);
                handleApprove();
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => {
                setIsApproving(false);
                handleReject();
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
