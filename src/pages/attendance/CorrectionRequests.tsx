import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileEdit, Plus, Eye, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCorrections } from '@/hooks/useAttendance';
import { CorrectionRequestForm } from '@/components/attendance/CorrectionRequestForm';
import { supabase } from '@/integrations/supabase/client';

export default function CorrectionRequests() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<any>(null);
  const [eligibleRecords, setEligibleRecords] = useState<any[]>([]);

  const { data: corrections = [], isLoading, refetch } = useCorrections({
    employee_id: employeeId || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (employee) {
      setEmployeeId(employee.id);
      fetchEligibleRecords(employee.id);
    }
  };

  const fetchEligibleRecords = async (empId: string) => {
    // Fetch attendance records from past 7 days that are within 24hr correction window
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', empId)
      .gte('attendance_date', sevenDaysAgo.toISOString().split('T')[0])
      .eq('locked_for_payroll', false)
      .order('attendance_date', { ascending: false });

    if (!error && data) {
      // Filter records within 24hr window
      const eligible = data.filter(record => {
        const recordDate = new Date(record.attendance_date);
        const deadline = new Date(recordDate);
        deadline.setHours(deadline.getHours() + 24);
        return new Date() < deadline;
      });
      setEligibleRecords(eligible);
    }
  };

  // Calculate summary metrics
  const pendingCount = corrections.filter(c => c.status === 'pending').length;
  const thisMonthApproved = corrections.filter(c => {
    const createdDate = new Date(c.created_at);
    const now = new Date();
    return c.status === 'approved' && 
           createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthRejected = corrections.filter(c => {
    const createdDate = new Date(c.created_at);
    const now = new Date();
    return c.status === 'rejected' && 
           createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear();
  }).length;

  const getCorrectionTypeLabel = (type: string) => {
    switch (type) {
      case 'clock_in': return 'Clock-In';
      case 'clock_out': return 'Clock-Out';
      case 'both': return 'Both Times';
      case 'full_record': return 'Full Record';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Correction Requests</h1>
        <p className="text-muted-foreground">Manage your attendance correction requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthApproved}</div>
            <p className="text-xs text-muted-foreground">Successfully corrected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected This Month</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthRejected}</div>
            <p className="text-xs text-muted-foreground">Review rejections</p>
          </CardContent>
        </Card>
      </div>

      {/* Corrections Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Correction Requests</CardTitle>
              <CardDescription>View and track your submitted corrections</CardDescription>
            </div>
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
              <Button onClick={() => setIsFormOpen(true)} disabled={eligibleRecords.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {corrections.length === 0 ? (
            <div className="text-center py-12">
              <FileEdit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No correction requests yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Submit a correction request if you forgot to clock in/out or need to adjust your attendance
              </p>
              {eligibleRecords.length > 0 && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit First Request
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendance Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corrections.map((correction) => (
                    <TableRow key={correction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(correction.attendance_records?.attendance_date || ''), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCorrectionTypeLabel(correction.correction_type)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{correction.reason}</TableCell>
                      <TableCell>
                        <Badge variant={
                          correction.status === 'approved' ? 'default' : 
                          correction.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {correction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(correction.created_at), 'MMM d, h:mm a')}</TableCell>
                      <TableCell>
                        {correction.is_within_deadline ? (
                          <span className="text-sm text-green-600">Within window</span>
                        ) : (
                          <span className="text-sm text-red-600">Expired</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCorrection(correction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correction Request Form Dialog */}
      {isFormOpen && eligibleRecords.length > 0 && (
        <CorrectionRequestForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          attendanceRecordId={eligibleRecords[0].id}
          attendanceDate={eligibleRecords[0].attendance_date}
          originalClockIn={eligibleRecords[0].clock_in_time}
          originalClockOut={eligibleRecords[0].clock_out_time}
          onSuccess={() => {
            refetch();
            fetchEligibleRecords(employeeId!);
          }}
        />
      )}

      {/* View Details Dialog */}
      {selectedCorrection && (
        <Dialog open={!!selectedCorrection} onOpenChange={() => setSelectedCorrection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Correction Request Details</DialogTitle>
              <DialogDescription>
                Submitted on {format(new Date(selectedCorrection.created_at), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Attendance Date:</span>
                  <p className="font-medium">
                    {format(new Date(selectedCorrection.attendance_records?.attendance_date || ''), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{getCorrectionTypeLabel(selectedCorrection.correction_type)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={
                    selectedCorrection.status === 'approved' ? 'default' : 
                    selectedCorrection.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }>
                    {selectedCorrection.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Within Deadline:</span>
                  <p className="font-medium">{selectedCorrection.is_within_deadline ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="mt-1 text-sm bg-muted p-3 rounded">{selectedCorrection.reason}</p>
              </div>

              {selectedCorrection.reviewer_notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Reviewer Notes:</span>
                  <p className="mt-1 text-sm bg-muted p-3 rounded">{selectedCorrection.reviewer_notes}</p>
                </div>
              )}

              {selectedCorrection.attachment_url && (
                <Button variant="outline" asChild>
                  <a href={selectedCorrection.attachment_url} target="_blank" rel="noopener noreferrer">
                    View Attachment
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
