import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Clock, AlertCircle, Users } from 'lucide-react';
import { useDailyAttendanceSummary } from '@/hooks/useAttendanceReport';
import { AttendanceReportCard } from '@/components/attendance/AttendanceReportCard';
import { DailyAttendanceTab } from '@/components/attendance/DailyAttendanceTab';
import { MonthlyReportTab } from '@/components/attendance/MonthlyReportTab';
import { StatisticsTab } from '@/components/attendance/StatisticsTab';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendanceReport() {
  const [activeTab, setActiveTab] = useState('daily');
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  const { data: todaySummary, isLoading: isSummaryLoading } = useDailyAttendanceSummary(todayDate);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Report</h1>
        <p className="text-muted-foreground">
          Comprehensive attendance analytics and reporting for HR management
        </p>
      </div>

      {/* Header Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isSummaryLoading ? (
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
              label="Present Today"
              value={todaySummary?.present_count || 0}
              icon={UserCheck}
              variant="success"
            />
            <AttendanceReportCard
              label="On Time"
              value={todaySummary?.on_time_count || 0}
              icon={Clock}
              variant="info"
            />
            <AttendanceReportCard
              label="Late"
              value={todaySummary?.late_count || 0}
              icon={AlertCircle}
              variant="warning"
            />
            <AttendanceReportCard
              label="Total Active Staff"
              value={todaySummary?.total_staff || 0}
              icon={Users}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <DailyAttendanceTab />
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <MonthlyReportTab />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <StatisticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
