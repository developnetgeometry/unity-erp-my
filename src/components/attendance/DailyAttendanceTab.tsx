import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { useAttendanceRecords } from '@/hooks/useAttendance';
import { AttendanceReportCard } from './AttendanceReportCard';
import { ExportButton } from './ExportButton';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarCalendar } from './SidebarCalendar';

export const DailyAttendanceTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: records, isLoading } = useAttendanceRecords({
    startDate: dateStr,
    endDate: dateStr,
  });

  // Calculate summary stats
  const totalStaff = new Set(records?.map(r => r.employee_id)).size || 0;
  const presentRecords = records?.filter(r => r.status === 'on_time' || r.status === 'late' || r.status === 'half_day') || [];
  const presentCount = presentRecords.length;
  const absentCount = records?.filter(r => r.status === 'absent')?.length || 0;
  const attendanceRate = totalStaff > 0 ? (presentCount / totalStaff) * 100 : 0;

  // Filter records
  const filteredRecords = records?.filter(record => {
    const matchesSearch = searchQuery === '' ||
      record.employees?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employees?.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      on_time: { variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      late: { variant: 'secondary', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      absent: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      half_day: { variant: 'secondary', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
      leave: { variant: 'outline', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      holiday: { variant: 'outline', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    };

    const config = variants[status] || variants.on_time;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Sidebar - Calendar */}
      <div className="w-full lg:w-[30%] lg:flex-shrink-0">
        <Card className="h-full lg:sticky lg:top-4">
          <CardContent className="p-4 h-full flex flex-col">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Select Date
            </h3>
            <SidebarCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              className="flex-1"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 overflow-auto">
        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <AttendanceReportCard
              label="Total Staff"
              value={totalStaff}
              icon={Users}
              variant="purple"
            />
            <AttendanceReportCard
              label="Present"
              value={presentCount}
              icon={UserCheck}
              variant="success"
              subtitle={`${totalStaff > 0 ? ((presentCount / totalStaff) * 100).toFixed(1) : 0}%`}
            />
            <AttendanceReportCard
              label="Absent"
              value={absentCount}
              icon={UserX}
              variant="danger"
              subtitle={`${totalStaff > 0 ? ((absentCount / totalStaff) * 100).toFixed(1) : 0}%`}
            />
            <AttendanceReportCard
              label="Attendance Rate"
              value={`${attendanceRate.toFixed(1)}%`}
              icon={TrendingUp}
              variant={attendanceRate >= 90 ? 'success' : attendanceRate >= 70 ? 'warning' : 'danger'}
            />
          </>
        )}
        </div>

        {/* Search and Filters */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Attendance Records</CardTitle>
            <ExportButton
              data={filteredRecords}
              filename={`attendance-${dateStr}`}
              type="daily"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, IC, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_time">On Time</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <UserX className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No attendance records found</p>
              <p className="text-sm">Adjust filters or select a different date</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>IC Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Site</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employees?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.clock_in_time
                          ? format(new Date(record.clock_in_time), 'HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.clock_out_time
                          ? format(new Date(record.clock_out_time), 'HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>{record.work_sites?.site_name || 'Office'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
};
