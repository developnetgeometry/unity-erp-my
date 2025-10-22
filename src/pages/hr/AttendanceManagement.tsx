import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, MapPin, AlertTriangle, Filter, Search } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useAttendanceRecords } from '@/hooks/useAttendance';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';
import { useDepartments } from '@/hooks/useDepartments';

const AttendanceManagement = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Filters state
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data with filters
  const { data: records = [], isLoading, refetch } = useAttendanceRecords({
    startDate,
    endDate,
    status: statusFilter || undefined,
    department: departmentFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: departments = [] } = useDepartments();

  // Calculate summary from records
  const summary = {
    present_count: records.filter(r => ['on_time', 'late', 'half_day'].includes(r.status)).length,
    late_count: records.filter(r => r.status === 'late').length,
    absent_count: records.filter(r => r.status === 'absent').length,
    provisional_count: records.filter(r => r.is_provisional).length,
    average_hours: records.length > 0
      ? records.reduce((sum, r) => sum + (r.hours_worked || 0), 0) / records.length
      : 0,
    total_employees: records.length,
  };

  const handleQuickFilter = (days: number) => {
    if (days === 0) {
      setStartDate(today);
      setEndDate(today);
    } else {
      setStartDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
      setEndDate(today);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and monitor employee attendance
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Quick Date Filters */}
            <div className="lg:col-span-2 flex gap-2">
              <Button
                variant={startDate === today && endDate === today ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter(0)}
              >
                Today
              </Button>
              <Button
                variant={startDate === format(subDays(new Date(), 7), 'yyyy-MM-dd') ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter(7)}
              >
                7 Days
              </Button>
              <Button
                variant={startDate === format(subDays(new Date(), 30), 'yyyy-MM-dd') ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter(30)}
              >
                30 Days
              </Button>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="on_time">On Time</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          {
            title: 'Present',
            value: summary.present_count.toString(),
            icon: CheckCircle,
            color: 'text-green-500',
          },
          {
            title: 'Late Arrivals',
            value: summary.late_count.toString(),
            icon: AlertCircle,
            color: 'text-yellow-500',
          },
          {
            title: 'Absent',
            value: summary.absent_count.toString(),
            icon: XCircle,
            color: 'text-red-500',
          },
          {
            title: 'Provisional',
            value: summary.provisional_count.toString(),
            icon: AlertTriangle,
            color: 'text-amber-500',
          },
          {
            title: 'Avg. Hours',
            value: summary.average_hours.toFixed(1),
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

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records ({records.length} employees)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for the selected filters.
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
                        <span>•</span>
                        <span>{format(new Date(record.attendance_date), 'MMM d')}</span>
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

                    <AttendanceStatusBadge
                      status={record.status as any}
                      isProvisional={record.is_provisional}
                      isLocked={record.locked_for_payroll}
                      size="md"
                    />
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