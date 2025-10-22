import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useAttendanceSettings, useWorkSites, useCreateSite, useUpdateSite, useDeleteSite } from '@/hooks/useAttendance';
import { toast } from '@/lib/toast-api';
import { AddSiteModal } from '@/components/attendance/AddSiteModal';
import { modal } from '@/lib/modal-api';

const AttendanceSettings = () => {
  const { data: config, isLoading: configLoading, refetch } = useAttendanceSettings();
  const { data: sites = [], refetch: refetchSites } = useWorkSites();
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const deleteSite = useDeleteSite();

  const [clockInTime, setClockInTime] = useState('09:00');
  const [clockOutTime, setClockOutTime] = useState('18:00');
  const [gracePeriod, setGracePeriod] = useState('10');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [showAddSite, setShowAddSite] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);

  // Load config when available
  useState(() => {
    if (config) {
      setClockInTime(config.default_clock_in_time || '09:00');
      setClockOutTime(config.default_clock_out_time || '18:00');
      setGracePeriod(config.grace_period_minutes?.toString() || '10');
      setGeofenceRadius(config.geofence_radius_meters?.toString() || '100');
    }
  });

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
      refetch();
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
        <h1 className="text-3xl font-bold text-foreground">Attendance Settings</h1>
        <p className="text-muted-foreground">
          Configure clock in/out times and manage work site locations
        </p>
      </div>

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

export default AttendanceSettings;
