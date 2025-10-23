import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Clock, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { useOvertimeSessions } from '@/hooks/useAttendance';
import { OTClockOutButton } from '@/components/attendance/OTClockOutButton';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function OvertimeTracking() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Fetch sessions for current employee
  const { data: sessions = [], isLoading, refetch } = useOvertimeSessions({
    employee_id: employeeId || undefined,
  });

  useEffect(() => {
    fetchEmployeeId();
  }, []);

  const fetchEmployeeId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (employee) {
      setEmployeeId(employee.id);
    }
  };

  // Find active session
  const activeSession = sessions.find(s => s.status === 'active');

  // Calculate elapsed time for active session
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - new Date(activeSession.ot_in_time).getTime()) / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Calculate summary metrics
  const thisMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.ot_in_time);
    const now = new Date();
    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
  });

  const totalOTHours = thisMonthSessions.reduce((sum, s) => sum + (s.total_ot_hours || 0), 0);
  const approvedOTHours = thisMonthSessions
    .filter(s => s.is_approved)
    .reduce((sum, s) => sum + (s.total_ot_hours || 0), 0);
  const pendingHours = thisMonthSessions
    .filter(s => s.status === 'completed' && !s.is_approved)
    .reduce((sum, s) => sum + (s.total_ot_hours || 0), 0);
  const avgHoursPerSession = thisMonthSessions.length > 0 
    ? totalOTHours / thisMonthSessions.length 
    : 0;

  const exportToCSV = () => {
    const csvData = sessions.map(s => ({
      Date: format(new Date(s.ot_in_time), 'yyyy-MM-dd'),
      Site: s.work_sites?.site_name || 'N/A',
      'OT In': format(new Date(s.ot_in_time), 'HH:mm'),
      'OT Out': s.ot_out_time ? format(new Date(s.ot_out_time), 'HH:mm') : 'Active',
      'Total Hours': s.total_ot_hours?.toFixed(2) || '0',
      Status: s.status,
      Approved: s.is_approved ? 'Yes' : 'Pending',
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overtime-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Overtime</h1>
        <p className="text-muted-foreground">Track and manage your overtime hours</p>
      </div>

      {/* Active OT Session Card */}
      {activeSession && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-6 w-6 animate-pulse" />
              Active Overtime Session
            </CardTitle>
            <CardDescription>You're currently tracking overtime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">OT Started</p>
                <p className="text-lg font-bold">{format(new Date(activeSession.ot_in_time), 'h:mm a')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Work Site</p>
                <p className="text-lg font-medium">{activeSession.work_sites?.site_name || 'N/A'}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm text-muted-foreground mb-1">Elapsed Time</p>
                <p className="text-2xl font-mono font-bold text-primary">{elapsedTime}</p>
              </div>
            </div>
            <OTClockOutButton
              otSessionId={activeSession.id}
              otInTime={activeSession.ot_in_time}
              siteId={activeSession.site_id}
              onSuccess={() => refetch()}
              className="w-full"
              size="lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOTHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedOTHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">Ready for payroll</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">Awaiting HR approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoursPerSession.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">This month's average</p>
          </CardContent>
        </Card>
      </div>

      {/* OT History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overtime History</CardTitle>
              <CardDescription>Your past overtime sessions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={sessions.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No overtime sessions yet</p>
              <p className="text-sm text-muted-foreground">
                Start tracking overtime after clocking out from your regular shift
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Work Site</TableHead>
                    <TableHead>OT In</TableHead>
                    <TableHead>OT Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{format(new Date(session.ot_in_time), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{session.work_sites?.site_name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(session.ot_in_time), 'h:mm a')}</TableCell>
                      <TableCell>
                        {session.ot_out_time ? format(new Date(session.ot_out_time), 'h:mm a') : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {session.total_ot_hours?.toFixed(2) || '0.00'} hrs
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          session.status === 'active' ? 'default' : 
                          session.status === 'completed' ? 'secondary' : 
                          'outline'
                        }>
                          {session.status === 'active' ? 'Active' : 
                           session.status === 'completed' ? 'Completed' : 
                           'Auto-Closed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.is_approved ? 'default' : 'outline'}>
                          {session.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
