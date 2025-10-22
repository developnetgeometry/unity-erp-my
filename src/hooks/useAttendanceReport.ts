import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface DailySummary {
  present_count: number;
  on_time_count: number;
  late_count: number;
  total_staff: number;
  attendance_rate: number;
}

export interface MonthlyEmployeeSummary {
  employee_id: string;
  employee_name: string;
  ic_number: string;
  phone: string;
  site_name: string;
  present_days: number;
  absent_days: number;
  late_count: number;
  attendance_rate: number;
  total_hours: number;
}

export interface AttendanceStatistics {
  departmentRates: { department: string; rate: number }[];
  distribution: { name: string; value: number }[];
  trend: { date: string; rate: number }[];
}

export const useDailyAttendanceSummary = (date: string) => {
  return useQuery({
    queryKey: ['daily-attendance-summary', date],
    queryFn: async () => {
      // Get total active staff
      const { data: totalStaff, error: staffError } = await supabase
        .from('employees')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      if (staffError) throw staffError;

      // Get attendance records for the date
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          employees!inner(company_id, status),
          notes
        `)
        .eq('attendance_date', date)
        .eq('employees.status', 'active');

      if (recordsError) throw recordsError;

      const presentCount = records?.filter(r => r.status === 'on_time' || r.status === 'late' || r.status === 'half_day')?.length || 0;
      const onTimeCount = records?.filter(r => 
        r.status === 'on_time'
      )?.length || 0;
      const lateCount = records?.filter(r => r.notes?.includes('Late'))?.length || 0;
      const totalStaffCount = totalStaff?.length || 0;

      return {
        present_count: presentCount,
        on_time_count: onTimeCount,
        late_count: lateCount,
        total_staff: totalStaffCount,
        attendance_rate: totalStaffCount > 0 ? (presentCount / totalStaffCount) * 100 : 0,
      } as DailySummary;
    },
    enabled: !!date,
  });
};

export const useMonthlyAttendanceSummary = (month: string, year: string) => {
  return useQuery({
    queryKey: ['monthly-attendance-summary', month, year],
    queryFn: async () => {
      const monthNum = String(parseInt(month)).padStart(2, '0');
      const startDate = `${year}-${monthNum}-01`;
      const endDateObj = endOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
      const endDate = format(endDateObj, 'yyyy-MM-dd');

      // Get all attendance records for the month
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          employees!inner(
            id,
            full_name,
            ic_number,
            phone,
            status,
            employee_sites!inner(
              work_sites(site_name)
            )
          )
        `)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate)
        .eq('employees.status', 'active');

      if (recordsError) throw recordsError;

      // Group by employee
      const employeeMap = new Map<string, MonthlyEmployeeSummary>();

      records?.forEach((record: any) => {
        const empId = record.employee_id;
        if (!employeeMap.has(empId)) {
          employeeMap.set(empId, {
            employee_id: empId,
            employee_name: record.employees.full_name,
            ic_number: record.employees.ic_number || 'N/A',
            phone: record.employees.phone || 'N/A',
            site_name: record.employees.employee_sites?.[0]?.work_sites?.site_name || 'N/A',
            present_days: 0,
            absent_days: 0,
            late_count: 0,
            attendance_rate: 0,
            total_hours: 0,
          });
        }

        const summary = employeeMap.get(empId)!;

        if (record.status === 'on_time' || record.status === 'late' || record.status === 'half_day') {
          summary.present_days++;
        } else if (record.status === 'absent') {
          summary.absent_days++;
        }

        if (record.status === 'late') {
          summary.late_count++;
        }

        summary.total_hours += parseFloat(record.hours_worked || 0);
      });

      // Calculate working days in month
      const daysInMonth = eachDayOfInterval({
        start: new Date(parseInt(year), parseInt(month) - 1, 1),
        end: endDateObj,
      }).filter(day => day.getDay() !== 0 && day.getDay() !== 6).length;

      // Calculate attendance rates
      const summaries = Array.from(employeeMap.values()).map(summary => ({
        ...summary,
        attendance_rate: daysInMonth > 0 ? (summary.present_days / daysInMonth) * 100 : 0,
        total_hours: Math.round(summary.total_hours * 100) / 100,
      }));

      return summaries;
    },
    enabled: !!month && !!year,
  });
};

export const useAttendanceStatistics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['attendance-statistics', startDate, endDate],
    queryFn: async () => {
      // Get attendance records with department info
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          employees!inner(
            departments(name)
          )
        `)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      if (error) throw error;

      // Calculate department rates
      const deptMap = new Map<string, { present: number; total: number }>();
      
      records?.forEach((record: any) => {
        const deptName = record.employees?.departments?.name || 'No Department';
        if (!deptMap.has(deptName)) {
          deptMap.set(deptName, { present: 0, total: 0 });
        }
        const dept = deptMap.get(deptName)!;
        dept.total++;
        if (record.status === 'on_time' || record.status === 'late' || record.status === 'half_day') {
          dept.present++;
        }
      });

      const departmentRates = Array.from(deptMap.entries()).map(([department, stats]) => ({
        department,
        rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
      }));

      // Calculate distribution
      const statusCounts = {
        present: 0,
        absent: 0,
        late: 0,
        on_leave: 0,
      };

      records?.forEach((record: any) => {
        if (record.status === 'on_time' || record.status === 'half_day') {
          statusCounts.present++;
        } else if (record.status === 'late') {
          statusCounts.late++;
        } else if (record.status === 'absent') {
          statusCounts.absent++;
        } else if (record.status === 'leave') {
          statusCounts.on_leave++;
        }
      });

      const distribution = [
        { name: 'Present', value: statusCounts.present },
        { name: 'Absent', value: statusCounts.absent },
        { name: 'Late', value: statusCounts.late },
        { name: 'On Leave', value: statusCounts.on_leave },
      ];

      // Calculate trend (daily rates)
      const dateMap = new Map<string, { present: number; total: number }>();
      
      records?.forEach((record: any) => {
        const date = record.attendance_date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { present: 0, total: 0 });
        }
        const dayStats = dateMap.get(date)!;
        dayStats.total++;
        if (record.status === 'on_time' || record.status === 'late' || record.status === 'half_day') {
          dayStats.present++;
        }
      });

      const trend = Array.from(dateMap.entries())
        .map(([date, stats]) => ({
          date,
          rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        departmentRates,
        distribution,
        trend,
      } as AttendanceStatistics;
    },
    enabled: !!startDate && !!endDate,
  });
};
