import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { toast } from '@/lib/toast-api';
import { format } from 'date-fns';

interface AttendanceSummary {
  present_count: number;
  late_count: number;
  absent_count: number;
  average_hours: number;
  total_employees: number;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  status: string;
  hours_worked: number;
  overtime_hours: number;
  employees: {
    full_name: string;
    position: string;
  };
  work_sites: {
    site_name: string;
  } | null;
}

const AttendanceManagement = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch today's attendance records
      const today = new Date().toISOString().split('T')[0];
      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          employees!inner(full_name, position, company_id),
          work_sites(site_name)
        `)
        .eq('attendance_date', today)
        .order('clock_in_time', { ascending: false, nullsFirst: false });

      if (recordsError) {
        console.error('Records error:', recordsError);
        toast.error('Failed to load attendance records');
      } else {
        setRecords(recordsData || []);
        
        // Calculate summary from records
        const presentStatuses = ['on_time', 'late', 'half_day'];
        const presentCount = recordsData?.filter(r => presentStatuses.includes(r.status)).length || 0;
        const lateCount = recordsData?.filter(r => r.status === 'late').length || 0;
        const absentCount = recordsData?.filter(r => r.status === 'absent').length || 0;
        const totalHours = recordsData?.reduce((sum, r) => sum + (r.hours_worked || 0), 0) || 0;
        const avgHours = presentCount > 0 ? totalHours / presentCount : 0;
        
        setSummary({
          present_count: presentCount,
          late_count: lateCount,
          absent_count: absentCount,
          average_hours: avgHours,
          total_employees: recordsData?.length || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_time':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            On Time
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Late
          </Badge>
        );
      case 'half_day':
        return (
          <Badge className="bg-orange-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Half Day
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      case 'leave':
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Leave
          </Badge>
        );
      case 'holiday':
        return (
          <Badge className="bg-purple-500">
            <Clock className="h-3 w-3 mr-1" />
            Holiday
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and monitor employee attendance for {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: 'Present Today',
            value: summary?.present_count?.toString() || '0',
            icon: CheckCircle,
            color: 'text-green-500',
          },
          {
            title: 'Late Arrivals',
            value: summary?.late_count?.toString() || '0',
            icon: AlertCircle,
            color: 'text-yellow-500',
          },
          {
            title: 'Absent',
            value: summary?.absent_count?.toString() || '0',
            icon: XCircle,
            color: 'text-red-500',
          },
          {
            title: 'Avg. Hours',
            value: summary?.average_hours?.toFixed(1) || '0.0',
            icon: Clock,
            color: 'text-blue-500',
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance ({records.length} employees)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records for today yet.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {record.employees.full_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{record.employees.position}</span>
                        {record.work_sites && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {record.work_sites.site_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">
                        {record.clock_in_time
                          ? format(new Date(record.clock_in_time), 'h:mm a')
                          : '-'}
                      </p>
                      {record.clock_out_time && (
                        <p className="text-xs text-muted-foreground">
                          Out: {format(new Date(record.clock_out_time), 'h:mm a')}
                        </p>
                      )}
                    </div>

                    {record.hours_worked > 0 && (
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium">{record.hours_worked}hrs</p>
                        {record.overtime_hours > 0 && (
                          <p className="text-xs text-orange-500">
                            +{record.overtime_hours}hrs OT
                          </p>
                        )}
                      </div>
                    )}

                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;