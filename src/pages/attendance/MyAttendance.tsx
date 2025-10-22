import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getCurrentPosition, GeolocationError } from '@/lib/geolocation';
import { toast } from '@/lib/toast-api';
import { format } from 'date-fns';
import { OTClockInButton } from '@/components/attendance/OTClockInButton';
import { OTClockOutButton } from '@/components/attendance/OTClockOutButton';
import { ClockInButton } from '@/components/attendance/ClockInButton';
import { ClockOutButton } from '@/components/attendance/ClockOutButton';
import { useOvertimeSessions } from '@/hooks/useAttendance';

interface AttendanceStatus {
  attendance: any;
  has_clocked_in: boolean;
  has_clocked_out: boolean;
}

export default function MyAttendance() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [workSites, setWorkSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Fetch active OT session
  const { data: otSessions = [] } = useOvertimeSessions({
    employee_id: employeeId || undefined,
    status: 'active',
  });
  const activeOTSession = otSessions[0];

  useEffect(() => {
    fetchData();
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch my attendance status
      const { data: statusData, error: statusError } = await supabase.functions.invoke(
        'hr-attendance/my-status',
        { method: 'GET' }
      );

      if (statusError) throw statusError;
      setStatus(statusData);

      // Get employee ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (employee) {
          setEmployeeId(employee.id);
        }
      }

      // Fetch work sites
      const { data: sites, error: sitesError } = await supabase
        .from('work_sites')
        .select('*')
        .eq('is_active', true)
        .order('site_name');

      if (sitesError) throw sitesError;
      setWorkSites(sites || []);
      if (sites && sites.length > 0) {
        setSelectedSite(sites[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!selectedSite) {
      toast.error('Please select a work site');
      return;
    }

    setActionLoading(true);
    try {
      // Get current location
      const position = await getCurrentPosition();

      // Call clock-in API
      const { data, error } = await supabase.functions.invoke('hr-attendance/clock-in', {
        method: 'POST',
        body: {
          site_id: selectedSite,
          latitude: position.latitude,
          longitude: position.longitude,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data.message || 'Clocked in successfully!');
      fetchData();
    } catch (error: any) {
      if (error instanceof GeolocationError) {
        toast.error(error.message);
      } else {
        console.error('Clock-in error:', error);
        toast.error('Failed to clock in');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!status?.attendance?.id) return;

    setActionLoading(true);
    try {
      const position = await getCurrentPosition();

      const { data, error } = await supabase.functions.invoke('hr-attendance/clock-out', {
        method: 'POST',
        body: {
          attendance_record_id: status.attendance.id,
          latitude: position.latitude,
          longitude: position.longitude,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(
        `Clocked out! ${data.hours_worked || 0}hrs worked${
          data.overtime_hours ? ` (${data.overtime_hours}hrs overtime)` : ''
        }`
      );
      fetchData();
    } catch (error: any) {
      if (error instanceof GeolocationError) {
        toast.error(error.message);
      } else {
        console.error('Clock-out error:', error);
        toast.error('Failed to clock out');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_time':
        return <Badge className="bg-green-500">On Time</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500">Late</Badge>;
      case 'half_day':
        return <Badge className="bg-orange-500">Half Day</Badge>;
      case 'absent':
        return <Badge className="bg-red-500">Absent</Badge>;
      case 'leave':
        return <Badge className="bg-blue-500">Leave</Badge>;
      case 'holiday':
        return <Badge className="bg-purple-500">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Attendance</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {locationPermission === 'denied' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location access is blocked. Please enable location permissions in your browser
            settings to clock in/out.
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Today's Status</CardTitle>
          <CardDescription>Your attendance for today</CardDescription>
        </CardHeader>
        <CardContent>
          {status?.has_clocked_in ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(status.attendance.status)}
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Clock In</p>
                  <p className="font-medium">
                    {format(new Date(status.attendance.clock_in_time), 'h:mm a')}
                  </p>
                </div>
              </div>

              {status.has_clocked_out ? (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Clock Out</p>
                    <p className="font-medium">
                      {format(new Date(status.attendance.clock_out_time), 'h:mm a')}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-muted-foreground">Hours Worked</p>
                    <p className="font-medium text-lg">
                      {status.attendance.hours_worked || 0}hrs
                      {status.attendance.overtime_hours > 0 && (
                        <span className="text-sm text-orange-500 ml-2">
                          +{status.attendance.overtime_hours}hrs OT
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    You're clocked in. Don't forget to clock out when you leave!
                  </p>
                  <ClockOutButton
                    attendanceRecordId={status.attendance.id}
                    siteId={status.attendance.site_id}
                    siteName={status.attendance.work_sites?.site_name || 'Work Site'}
                    siteLatitude={status.attendance.work_sites?.latitude || 0}
                    siteLongitude={status.attendance.work_sites?.longitude || 0}
                    siteRadius={status.attendance.work_sites?.radius_meters || 100}
                    clockInTime={status.attendance.clock_in_time}
                    onSuccess={() => fetchData()}
                  />
                </div>
              )}

              {status.attendance.work_sites && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <MapPin className="h-4 w-4" />
                  {status.attendance.work_sites.site_name}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You haven't clocked in today. Click below to start tracking your attendance.
                </AlertDescription>
              </Alert>

              <ClockInButton onSuccess={() => fetchData()} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overtime Section */}
      {status?.has_clocked_out && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Overtime
            </CardTitle>
            <CardDescription>
              {activeOTSession ? 'You have an active overtime session' : 'Track overtime hours after your shift'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeOTSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active OT Session</p>
                    <p className="font-medium">Started at {format(new Date(activeOTSession.ot_in_time), 'h:mm a')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Site: {activeOTSession.work_sites?.site_name}
                    </p>
                  </div>
                  <OTClockOutButton
                    otSessionId={activeOTSession.id}
                    otInTime={activeOTSession.ot_in_time}
                    siteId={activeOTSession.site_id}
                    onSuccess={() => fetchData()}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You've completed your regular shift. Start tracking overtime if you're continuing to work.
                </p>
                <OTClockInButton
                  attendanceRecordId={status.attendance.id}
                  onSuccess={() => fetchData()}
                  className="w-full"
                  size="lg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Clock In/Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <div className="mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Clock In</p>
              <p>Select your work site and tap "Clock In" when you arrive at work. Make sure you're within the site's geofence radius (usually 100m).</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-1">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Clock Out</p>
              <p>Tap "Clock Out" when you leave work. Your hours worked and any overtime will be calculated automatically.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-1">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Location Required</p>
              <p>Location access is required to verify you're at the work site. If you can't clock in due to location issues, contact your HR manager.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}