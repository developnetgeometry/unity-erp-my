import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInHours } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, Upload, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubmitCorrection } from '@/hooks/useAttendance';
import { toast } from '@/lib/toast-api';

const correctionSchema = z.object({
  correction_type: z.enum(['clock_in', 'clock_out', 'both', 'full_record']),
  requested_clock_in: z.string().optional(),
  requested_clock_out: z.string().optional(),
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  attachment: z.instanceof(File).optional(),
});

type CorrectionFormData = z.infer<typeof correctionSchema>;

interface CorrectionRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceRecordId: string;
  attendanceDate: string;
  originalClockIn?: string;
  originalClockOut?: string;
  onSuccess?: () => void;
}

export function CorrectionRequestForm({
  isOpen,
  onClose,
  attendanceRecordId,
  attendanceDate,
  originalClockIn,
  originalClockOut,
  onSuccess,
}: CorrectionRequestFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const submitCorrection = useSubmitCorrection();

  const form = useForm<CorrectionFormData>({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      correction_type: 'both',
      requested_clock_in: originalClockIn ? format(new Date(originalClockIn), "yyyy-MM-dd'T'HH:mm") : '',
      requested_clock_out: originalClockOut ? format(new Date(originalClockOut), "yyyy-MM-dd'T'HH:mm") : '',
      reason: '',
    },
  });

  const correctionType = form.watch('correction_type');
  const requestedClockIn = form.watch('requested_clock_in');
  const requestedClockOut = form.watch('requested_clock_out');

  // Calculate deadline (24 hours from attendance date)
  const deadline = new Date(attendanceDate);
  deadline.setHours(deadline.getHours() + 24);
  const hoursRemaining = differenceInHours(deadline, new Date());
  const isExpired = hoursRemaining < 0;

  const onSubmit = async (data: CorrectionFormData) => {
    if (isExpired) {
      toast.error('Correction deadline has passed');
      return;
    }

    try {
      await submitCorrection.mutateAsync({
        attendance_record_id: attendanceRecordId,
        correction_type: data.correction_type,
        requested_clock_in: data.requested_clock_in ? new Date(data.requested_clock_in).toISOString() : undefined,
        requested_clock_out: data.requested_clock_out ? new Date(data.requested_clock_out).toISOString() : undefined,
        reason: data.reason,
        attachment: file,
      });

      toast.success('Correction request submitted successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to submit correction request');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Attendance Correction</DialogTitle>
          <DialogDescription>
            Submit a correction request for {format(new Date(attendanceDate), 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Deadline Warning */}
          {!isExpired && hoursRemaining < 6 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Urgent:</span>
                  Only {hoursRemaining} hour{hoursRemaining !== 1 ? 's' : ''} remaining to submit
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isExpired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The 24-hour correction window has expired. Please contact HR for assistance.
              </AlertDescription>
            </Alert>
          )}

          {/* Correction Type */}
          <div className="space-y-2">
            <Label>Correction Type</Label>
            <Select
              value={form.watch('correction_type')}
              onValueChange={(value) => form.setValue('correction_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clock_in">Clock-In Only</SelectItem>
                <SelectItem value="clock_out">Clock-Out Only</SelectItem>
                <SelectItem value="both">Both Clock-In & Clock-Out</SelectItem>
                <SelectItem value="full_record">Full Record Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Original vs Requested Times */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <h4 className="font-medium text-sm">Time Comparison</h4>
            
            {(correctionType === 'clock_in' || correctionType === 'both' || correctionType === 'full_record') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Original Clock-In</Label>
                  <p className="text-sm font-medium">
                    {originalClockIn ? format(new Date(originalClockIn), 'h:mm a') : 'Not recorded'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="requested_clock_in">Requested Clock-In *</Label>
                  <Input
                    id="requested_clock_in"
                    type="datetime-local"
                    {...form.register('requested_clock_in')}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {(correctionType === 'clock_out' || correctionType === 'both' || correctionType === 'full_record') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Original Clock-Out</Label>
                  <p className="text-sm font-medium">
                    {originalClockOut ? format(new Date(originalClockOut), 'h:mm a') : 'Not recorded'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="requested_clock_out">Requested Clock-Out *</Label>
                  <Input
                    id="requested_clock_out"
                    type="datetime-local"
                    {...form.register('requested_clock_out')}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {requestedClockIn && requestedClockOut && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Change Preview:</p>
                <p className="text-sm font-medium">
                  {originalClockIn && format(new Date(originalClockIn), 'h:mm a')} → {format(new Date(requestedClockIn), 'h:mm a')}
                  {' | '}
                  {originalClockOut && format(new Date(originalClockOut), 'h:mm a')} → {format(new Date(requestedClockOut), 'h:mm a')}
                </p>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Correction *</Label>
            <Textarea
              id="reason"
              {...form.register('reason')}
              placeholder="Explain why this correction is needed (minimum 20 characters)..."
              rows={4}
              className="resize-none"
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {form.watch('reason')?.length || 0} / 20 characters minimum
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="attachment">Supporting Document (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachment"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {file && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  {file.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload MC, email proof, or other supporting documents (Max 5MB)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitCorrection.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isExpired || submitCorrection.isPending}>
              {submitCorrection.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
