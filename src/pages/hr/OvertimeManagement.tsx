import { useState, useEffect } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Download, TrendingUp, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react';
import { useOvertimeSessions, useReviewCorrection } from '@/hooks/useAttendance';
import { toast } from '@/lib/toast-api';

export default function OvertimeManagement() {
  const [activeElapsed, setActiveElapsed] = useState<Record<string, string>>({});

  const { data: sessions = [], isLoading, refetch } = useOvertimeSessions({});
  const reviewCorrection = useReviewCorrection();

  // Separate active and pending approval sessions
  const activeSessions = sessions.filter(s => s.status === 'active');
  const pendingApproval = sessions.filter(s => s.status === 'completed' && !s.is_approved);
  const approvedSessions = sessions.filter(s => s.is_approved);

  // Calculate metrics
  const thisMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.ot_in_time);
    const now = new Date();
    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
  });

  const totalOTHours = thisMonthSessions.reduce((sum, s) => sum + (s.total_ot_hours || 0), 0);
  const pendingHours = pendingApproval.reduce((sum, s) => sum + (s.total_ot_hours || 0), 0);
  const avgPerEmployee = thisMonthSessions.length > 0 ? totalOTHours / new Set(thisMonthSessions.map(s => s.employee_id)).size : 0;

  // Update elapsed time for active sessions
  useEffect(() => {
    if (activeSessions.length === 0) return;

    const interval = setInterval(() => {
      const newElapsed: Record<string, string> = {};
      activeSessions.forEach(session => {
        const seconds = Math.floor((Date.now() - new Date(session.ot_in_time).getTime()) / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        newElapsed[session.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      });
      setActiveElapsed(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessions]);

  const handleApprove = async (sessionId: string) => {
    try {
      // Update OT session approval status directly
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/overtime_sessions?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ is_approved: true }),
      });

      if (!response.ok) throw new Error('Failed to approve');
      
      toast.success('OT session approved');
      refetch();
    } catch (error) {
      toast.error('Failed to approve OT session');
    }
  };

  const exportToExcel = () => {
    const csvData = sessions.map(s => ({
      Employee: s.employees?.full_name || 'N/A',
      Position: s.employees?.position || 'N/A',
      Date: format(new Date(s.ot_in_time), 'yyyy-MM-dd'),
      Site: s.work_sites?.site_name || 'N/A',
      'OT In': format(new Date(s.ot_in_time), 'HH:mm'),
      'OT Out': s.ot_out_time ? format(new Date(s.ot_out_time), 'HH:mm') : 'Active',
      'Total Hours': s.total_ot_hours?.toFixed(2) || '0',
      Status: s.status,
      Approved: s.is_approved ? 'Yes' : 'No',
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overtime-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
        <h1 className="text-3xl font-bold mb-2">Overtime Management</h1>
        <p className="text-muted-foreground">Monitor and approve company-wide overtime</p>
      </div>

      {/* Summary Dashboard */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active OT Sessions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">Currently tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OT (Month)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOTHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">{thisMonthSessions.length} sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">{pendingApproval.length} sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Employee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerEmployee.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Sessions ({activeSessions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingApproval.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active OT Sessions */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Overtime Sessions</CardTitle>
              <CardDescription>Employees currently tracking overtime</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No active overtime sessions
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Work Site</TableHead>
                      <TableHead>OT In Time</TableHead>
                      <TableHead>Elapsed Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.employees?.full_name}</TableCell>
                        <TableCell>{session.employees?.position || 'N/A'}</TableCell>
                        <TableCell>{session.work_sites?.site_name}</TableCell>
                        <TableCell>{format(new Date(session.ot_in_time), 'h:mm a')}</TableCell>
                        <TableCell>
                          <span className="font-mono text-lg font-bold text-primary">
                            {activeElapsed[session.id] || '00:00:00'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>OT Approval Queue</CardTitle>
              <CardDescription>Review and approve completed overtime sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApproval.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No overtime sessions pending approval
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Work Site</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApproval.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.employees?.full_name}</TableCell>
                        <TableCell>{format(new Date(session.ot_in_time), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{session.work_sites?.site_name}</TableCell>
                        <TableCell className="font-bold">{session.total_ot_hours?.toFixed(2)} hrs</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(session.id)}
                            className="mr-2"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>OT History & Reports</CardTitle>
                  <CardDescription>View all overtime sessions</CardDescription>
                </div>
                <Button variant="outline" onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.employees?.full_name}</TableCell>
                      <TableCell>{session.employees?.position || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(session.ot_in_time), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-medium">{session.total_ot_hours?.toFixed(2)} hrs</TableCell>
                      <TableCell>
                        <Badge variant={
                          session.status === 'active' ? 'default' : 
                          session.status === 'completed' ? 'secondary' : 
                          'outline'
                        }>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.is_approved ? 'default' : 'outline'}>
                          {session.is_approved ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
