import { useState, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOTClockIn } from '@/hooks/useAttendance';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-api';
import { Progress } from '@/components/ui/progress';

interface OTClockInButtonProps extends Omit<ButtonProps, 'onClick'> {
  attendanceRecordId: string;
  hoursWorked?: number;
  onSuccess?: () => void;
}

export function OTClockInButton({
  attendanceRecordId,
  hoursWorked = 0,
  onSuccess,
  variant = 'default',
  size = 'default',
  ...props
}: OTClockInButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workSites, setWorkSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [hasActiveOT, setHasActiveOT] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);

  const otClockIn = useOTClockIn();
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  const canClockInOT = hoursWorked >= 9;
  const hoursRemaining = Math.max(0, 9 - hoursWorked);
  const progressPercentage = Math.min(100, (hoursWorked / 9) * 100);

  useEffect(() => {
    if (isDialogOpen) {
      fetchWorkSites();
      checkActiveOT();
    }
  }, [isDialogOpen]);

  const fetchWorkSites = async () => {
    setLoadingSites(true);
    try {
      const { data, error } = await supabase
        .from('work_sites')
        .select('*')
        .eq('is_active', true)
        .order('site_name');

      if (error) throw error;
      setWorkSites(data || []);
      if (data && data.length > 0) {
        setSelectedSite(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching work sites:', error);
      toast.error('Failed to load work sites');
    } finally {
      setLoadingSites(false);
    }
  };

  const checkActiveOT = async () => {
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!employee) return;

      const { data, error } = await supabase
        .from('overtime_sessions')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setHasActiveOT(!!data);
    } catch (error) {
      console.error('Error checking active OT:', error);
    }
  };

  const handleOTClockIn = async () => {
    if (!canClockInOT) {
      toast.error(`You must complete at least 9 working hours before starting overtime. ${hoursRemaining.toFixed(2)} hours remaining.`);
      return;
    }

    if (!selectedSite) {
      toast.error('Please select a work site');
      return;
    }

    if (hasActiveOT) {
      toast.error('You already have an active overtime session');
      return;
    }

    // Request location
    await requestLocation();
    
    if (geoError) {
      toast.error(geoError);
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Location not available');
      return;
    }

    try {
      await otClockIn.mutateAsync({
        attendance_record_id: attendanceRecordId,
        site_id: selectedSite,
        latitude: latitude,
        longitude: longitude,
      });

      toast.success('OT clock-in successful!');
      setIsDialogOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock in for overtime');
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          if (!canClockInOT) {
            toast.warning(`Complete ${hoursRemaining.toFixed(2)} more hours to start overtime`);
            return;
          }
          setIsDialogOpen(true);
        }}
        disabled={!canClockInOT}
        {...props}
      >
        <Clock className="mr-2 h-4 w-4" />
        Start Overtime {!canClockInOT && `(${hoursRemaining.toFixed(1)}h left)`}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Overtime Session</DialogTitle>
            <DialogDescription>
              You've completed {hoursWorked.toFixed(2)} hours of work. Select a work site to begin tracking overtime.
            </DialogDescription>
          </DialogHeader>

          {!canClockInOT && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You must complete at least 9 working hours before starting overtime. You need {hoursRemaining.toFixed(2)} more hours.
              </AlertDescription>
            </Alert>
          )}

          {hasActiveOT && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You already have an active overtime session. Please clock out before starting a new one.
              </AlertDescription>
            </Alert>
          )}

          {geoError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{geoError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work-site">Work Site *</Label>
              <Select
                value={selectedSite}
                onValueChange={setSelectedSite}
                disabled={loadingSites || hasActiveOT}
              >
                <SelectTrigger id="work-site">
                  <SelectValue placeholder="Select work site..." />
                </SelectTrigger>
                <SelectContent>
                  {workSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {site.site_name} - {site.address}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {latitude && longitude && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Location acquired
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={otClockIn.isPending || geoLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOTClockIn}
              disabled={
                !canClockInOT ||
                !selectedSite ||
                hasActiveOT ||
                otClockIn.isPending ||
                geoLoading ||
                !latitude ||
                !longitude
              }
            >
              {(otClockIn.isPending || geoLoading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {geoLoading ? 'Getting Location...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Clock In for OT
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
