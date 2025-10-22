import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, MapPin, AlertTriangle, Filter, Search, Plus, Pencil, Trash2, Save, Settings } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useAttendanceRecords, useAttendanceSettings, useWorkSites, useDeleteSite } from '@/hooks/useAttendance';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';
import { useDepartments } from '@/hooks/useDepartments';
import { AddSiteModal } from '@/components/attendance/AddSiteModal';
import { toast } from '@/lib/toast-api';
import { modal } from '@/lib/modal-api';

const AttendanceManagement = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Filters state
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Settings state
  const { data: config, isLoading: configLoading, refetch: refetchConfig } = useAttendanceSettings();
  const { data: sites = [], refetch: refetchSites } = useWorkSites();
  const deleteSite = useDeleteSite();
  const [clockInTime, setClockInTime] = useState('09:00');
  const [clockOutTime, setClockOutTime] = useState('18:00');
  const [gracePeriod, setGracePeriod] = useState('10');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [showAddSite, setShowAddSite] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);

  // Fetch data with filters
  const { data: records = [], isLoading, refetch } = useAttendanceRecords({
    startDate,
    endDate,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    search: searchQuery || undefined,
  });

  const { data: departments = [] } = useDepartments();

  // Load config when available
  useState(() => {
    if (config) {
      setClockInTime(config.default_clock_in_time || '09:00');
      setClockOutTime(config.default_clock_out_time || '18:00');
      setGracePeriod(config.grace_period_minutes?.toString() || '10');
      setGeofenceRadius(config.geofence_radius_meters?.toString() || '100');
    }
  });

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

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession())).data.session?.access_token}`,
          },
          body: JSON.stringify({
            default_clock_in_time: clockInTime,
            default_clock_out_time: clockOutTime,
            grace_period_minutes: parseInt(gracePeriod),
            geofence_radius_meters: parseInt(geofenceRadius),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('Settings saved successfully');
      refetchConfig();
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    const confirmed = await modal.confirm({
      title: 'Delete Site',
      message: `Are you sure you want to delete "${siteName}"? Employees assigned to this site will lose access.`,
      variant: 'danger',
      confirmLabel: 'Delete',
    });

    if (!confirmed) return;

    deleteSite.mutate(siteId, {
      onSuccess: () => {
        toast.success('Site deleted successfully');
        refetchSites();
      },
      onError: () => {
        toast.error('Failed to delete site');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground">
          Track employee attendance and configure system settings
        </p>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records" className="gap-2">
            <Clock className="h-4 w-4" />
            Records
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-end">
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
                <SelectItem value="all">All Statuses</SelectItem>
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
                <SelectItem value="all">All Departments</SelectItem>
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
          <CardTitle>Attendance Records ({new Set(records.map(r => r.employee_id)).size} employees, {records.length} records)</CardTitle>
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Clock In/Out Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Clock In/Out Configuration
              </CardTitle>
              <CardDescription>
                Set default clock in/out times and grace periods for all employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clock-in-time">Default Clock In Time</Label>
                  <Input
                    id="clock-in-time"
                    type="time"
                    value={clockInTime}
                    onChange={(e) => setClockInTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clock-out-time">Default Clock Out Time</Label>
                  <Input
                    id="clock-out-time"
                    type="time"
                    value={clockOutTime}
                    onChange={(e) => setClockOutTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grace-period">Grace Period (Minutes)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    min="0"
                    max="60"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Late allowance before marking as late
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geofence-radius">Geofence Radius (Meters)</Label>
                  <Input
                    id="geofence-radius"
                    type="number"
                    min="50"
                    max="500"
                    value={geofenceRadius}
                    onChange={(e) => setGeofenceRadius(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Location validation radius (default: 100m)
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={configLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Site Location Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Site Location Management
                  </CardTitle>
                  <CardDescription>
                    Define office and client site locations for geo-based attendance
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddSite(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sites configured yet. Add your first work site to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {sites.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground">{site.site_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{site.address}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>Lat: {site.latitude}</span>
                            <span>•</span>
                            <span>Lng: {site.longitude}</span>
                            <span>•</span>
                            <span>Radius: {site.radius_meters}m</span>
                            <span>•</span>
                            <span className={site.is_active ? 'text-green-500' : 'text-red-500'}>
                              {site.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSite(site)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSite(site.id, site.site_name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddSiteModal
        isOpen={showAddSite || !!editingSite}
        onClose={() => {
          setShowAddSite(false);
          setEditingSite(null);
        }}
        onSuccess={() => {
          refetchSites();
          setShowAddSite(false);
          setEditingSite(null);
        }}
        editSite={editingSite}
      />
    </div>
  );
};

export default AttendanceManagement;