import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileEdit, Download, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCorrections, useReviewCorrection } from '@/hooks/useAttendance';
import { CorrectionReviewCard } from '@/components/attendance/CorrectionReviewCard';
import { toast } from '@/lib/toast-api';

export default function CorrectionRequestsManagement() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const { data: corrections = [], isLoading, refetch } = useCorrections({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const reviewCorrection = useReviewCorrection();

  // Separate pending, urgent, and expired
  const pendingCorrections = corrections.filter(c => c.status === 'pending');
  const urgentCorrections = pendingCorrections.filter(c => c.is_within_deadline);
  const expiredCorrections = pendingCorrections.filter(c => !c.is_within_deadline);

  // Calculate metrics
  const pendingCount = pendingCorrections.length;
  const approvedToday = corrections.filter(c => {
    const reviewedDate = c.reviewed_at ? new Date(c.reviewed_at) : null;
    const today = new Date().toDateString();
    return c.status === 'approved' && reviewedDate && reviewedDate.toDateString() === today;
  }).length;

  const rejectedToday = corrections.filter(c => {
    const reviewedDate = c.reviewed_at ? new Date(c.reviewed_at) : null;
    const today = new Date().toDateString();
    return c.status === 'rejected' && reviewedDate && reviewedDate.toDateString() === today;
  }).length;

  const handleApprove = async (correctionId: string, reviewerNotes?: string) => {
    try {
      await reviewCorrection.mutateAsync({
        correction_id: correctionId,
        action: 'approve',
        reviewer_notes: reviewerNotes,
      });
      toast.success('Correction request approved');
      refetch();
    } catch (error) {
      toast.error('Failed to approve correction');
    }
  };

  const handleReject = async (correctionId: string, reviewerNotes: string) => {
    try {
      await reviewCorrection.mutateAsync({
        correction_id: correctionId,
        action: 'reject',
        reviewer_notes: reviewerNotes,
      });
      toast.success('Correction request rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject correction');
    }
  };

  const exportToCSV = () => {
    const csvData = corrections.map(c => ({
      Employee: c.employees?.full_name || 'N/A',
      Position: c.employees?.position || 'N/A',
      'Record ID': c.attendance_record_id,
      Type: c.correction_type,
      Reason: c.reason.replace(/,/g, ';'),
      Status: c.status,
      'Within Deadline': c.is_within_deadline ? 'Yes' : 'No',
      Submitted: format(new Date(c.created_at), 'yyyy-MM-dd HH:mm'),
      'Reviewer Notes': c.reviewer_notes?.replace(/,/g, ';') || '',
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `correction-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Correction Requests Management</h1>
        <p className="text-muted-foreground">Review and manage attendance corrections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {urgentCorrections.length} urgent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedToday}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedToday}</div>
            <p className="text-xs text-muted-foreground">Denied requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredCorrections.length}</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingCorrections.length})
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Pending Corrections Queue */}
        <TabsContent value="pending" className="space-y-4">
          {pendingCorrections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileEdit className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No pending correction requests</p>
                <p className="text-sm">All corrections have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Urgent Corrections */}
              {urgentCorrections.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Urgent (Within Deadline)</h3>
                  {urgentCorrections.map((correction) => (
                    <CorrectionReviewCard
                      key={correction.id}
                      correction={correction}
                      onApprove={(notes) => handleApprove(correction.id, notes)}
                      onReject={(notes) => handleReject(correction.id, notes)}
                    />
                  ))}
                </div>
              )}

              {/* Expired Corrections */}
              {expiredCorrections.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-600">Expired (Past Deadline)</h3>
                  {expiredCorrections.map((correction) => (
                    <CorrectionReviewCard
                      key={correction.id}
                      correction={correction}
                      onApprove={(notes) => handleApprove(correction.id, notes)}
                      onReject={(notes) => handleReject(correction.id, notes)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Correction History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Correction History</CardTitle>
              <CardDescription>View all reviewed corrections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {corrections
                  .filter(c => c.status !== 'pending')
                  .map((correction) => (
                    <div key={correction.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{correction.employees?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {correction.correction_type} - {correction.status}
                          </p>
                        </div>
                        <Badge variant={correction.status === 'approved' ? 'default' : 'destructive'}>
                          {correction.status}
                        </Badge>
                      </div>
                      {correction.reviewer_notes && (
                        <div className="text-sm bg-muted p-3 rounded">
                          <span className="font-medium">Reviewer Notes: </span>
                          {correction.reviewer_notes}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {correction.reviewed_at && `Reviewed on ${format(new Date(correction.reviewed_at), 'MMM d, yyyy h:mm a')}`}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
