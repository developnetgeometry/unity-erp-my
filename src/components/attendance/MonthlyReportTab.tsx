import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw } from 'lucide-react';
import { useMonthlyAttendanceSummary } from '@/hooks/useAttendanceReport';
import { ExportButton } from './ExportButton';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const MonthlyReportTab = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const { data: summaries, isLoading, refetch } = useMonthlyAttendanceSummary(selectedMonth, selectedYear);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const getRateBadge = (rate: number) => {
    if (rate >= 90) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>;
    } else if (rate >= 70) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Good</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Needs Improvement</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Select Period:</span>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Staff Attendance Summary - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardTitle>
            {summaries && summaries.length > 0 && (
              <ExportButton
                data={summaries}
                filename={`monthly-report-${selectedYear}-${selectedMonth}`}
                type="monthly"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !summaries || summaries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No attendance data available</p>
              <p className="text-sm">Select a different month or check if attendance records exist</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>IC Number</TableHead>
                    <TableHead>Mobile No</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead className="text-center">Present (Days)</TableHead>
                    <TableHead className="text-center">Absent (Days)</TableHead>
                    <TableHead className="text-center">Late (Count)</TableHead>
                    <TableHead className="text-center">Rate (%)</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((summary) => (
                    <TableRow key={summary.employee_id}>
                      <TableCell className="font-medium">{summary.employee_name}</TableCell>
                      <TableCell>{summary.ic_number}</TableCell>
                      <TableCell>{summary.phone}</TableCell>
                      <TableCell>{summary.site_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                          {summary.present_days}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
                          {summary.absent_days}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950">
                          {summary.late_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {summary.attendance_rate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {summary.total_hours.toFixed(2)}h
                      </TableCell>
                      <TableCell className="text-center">
                        {getRateBadge(summary.attendance_rate)}
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
};
