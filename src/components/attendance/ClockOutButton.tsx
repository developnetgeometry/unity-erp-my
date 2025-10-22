import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Loader2, AlertCircle, Timer } from 'lucide-react';
import { toast } from '@/lib/toast-api';
import { useClockOut, useAttendanceSettings } from '@/hooks/useAttendance';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/lib/geolocation';
import { useState } from 'react';

interface ClockOutButtonProps {
  attendanceRecordId: string;
  siteId: string;
  siteName: string;
  siteLatitude: number;
  siteLongitude: number;
  siteRadius: number;
  clockInTime: string;
  onSuccess?: () => void;
}

export function ClockOutButton({
  attendanceRecordId,
  siteId,
  siteName,
  siteLatitude,
  siteLongitude,
  siteRadius,
  clockInTime,
  onSuccess,
}: ClockOutButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { latitude, longitude, error, loading, requestLocation } = useGeolocation();
  const clockOut = useClockOut();
  const { data: config } = useAttendanceSettings();

  const distance = latitude && longitude
    ? calculateDistance(latitude, longitude, siteLatitude, siteLongitude)
    : null;
  const isWithinRadius = distance !== null && distance <= siteRadius;

  // Calculate hours worked so far
  const hoursWorked = clockInTime
    ? ((new Date().getTime() - new Date(clockInTime).getTime()) / (1000 * 60 * 60)).toFixed(1)
    : '0';

  // Check if minimum working hours requirement is met
  const checkMinimumHoursRequired = () => {
    if (!config?.late_clockin_adjustment_enabled || !clockInTime) return { required: false };

    const clockIn = new Date(clockInTime);
    const clockInDate = clockIn.toISOString().split('T')[0];
    const defaultClockInTime = config.default_clock_in_time || '09:00:00';
    const [hours, minutes] = defaultClockInTime.split(':').map(Number);
    
    // Calculate grace period end time
    const gracePeriodMinutes = config.grace_period_minutes || 10;
    const graceEndTime = new Date(`${clockInDate}T${defaultClockInTime}`);
    graceEndTime.setMinutes(graceEndTime.getMinutes() + gracePeriodMinutes);
    
    // Check if clocked in late
    if (clockIn > graceEndTime) {
      const minimumWorkingHours = config.minimum_working_hours || 9;
      const requiredClockOutTime = new Date(clockIn);
      requiredClockOutTime.setHours(requiredClockOutTime.getHours() + minimumWorkingHours);
      
      const now = new Date();
      if (now < requiredClockOutTime) {
        const remainingMinutes = Math.ceil((requiredClockOutTime.getTime() - now.getTime()) / (1000 * 60));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;
        
        return {
          required: true,
          remainingHours,
          remainingMinutes: remainingMins,
          minimumWorkingHours,
        };
      }
    }
    
    return { required: false };
  };

  const minHoursCheck = checkMinimumHoursRequired();

  const handleOpenDialog = () => {
    setShowDialog(true);
    requestLocation();
  };

  const handleClockOut = async () => {
    if (!latitude || !longitude) {
      toast.error('Please enable location');
      return;
    }

    if (!isWithinRadius) {
      toast.error(`You are ${formatDistance(distance!)} from the site. Must be within ${siteRadius}m.`);
      return;
    }

    clockOut.mutate({
      attendance_record_id: attendanceRecordId,
      latitude,
      longitude,
    }, {
      onSuccess: () => {
        toast.success('Clocked out successfully');
        setShowDialog(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to clock out');
      },
    });
  };

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        className="w-full h-16 text-lg"
        onClick={handleOpenDialog}
      >
        <Clock className="h-5 w-5 mr-2" />
        Clock Out
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Clock Out</DialogTitle>
            <DialogDescription>
              Verify your location and clock out from {siteName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Hours Worked */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hours Worked Today</span>
                <span className="text-2xl font-bold text-primary">{hoursWorked}hrs</span>
              </div>
            </div>

            {/* Minimum Hours Warning */}
            {minHoursCheck.required && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Timer className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Minimum Working Hours Required
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      You clocked in late and must work {minHoursCheck.minimumWorkingHours} hours. 
                      Please wait {minHoursCheck.remainingHours}h {minHoursCheck.remainingMinutes}m before clocking out.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Site Info */}
            <div className="space-y-2">
              <Label>Clocking Out From</Label>
              <div className="p-3 rounded-md border border-border bg-muted/50">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{siteName}</span>
                </div>
              </div>
            </div>

            {/* GPS Status */}
            <div className="space-y-2">
              <Label>Location Status</Label>
              <div className="p-3 rounded-md border border-border bg-muted/50">
                {loading && (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Acquiring GPS location...</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                {latitude && longitude && (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <MapPin className="h-4 w-4" />
                      <span>Location acquired</span>
                    </div>
                    {distance !== null && (
                      <div className="mt-2 pl-6">
                        <p className="text-muted-foreground">
                          Distance to site: <span className={isWithinRadius ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                            {formatDistance(distance)}
                          </span>
                        </p>
                        {!isWithinRadius && (
                          <p className="text-xs text-destructive mt-1">
                            Must be within {siteRadius}m to clock out
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!isWithinRadius || clockOut.isPending || minHoursCheck.required}
            >
              {clockOut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clocking Out...
                </>
              ) : minHoursCheck.required ? (
                <>
                  <Timer className="h-4 w-4 mr-2" />
                  Minimum Hours Not Met
                </>
              ) : (
                'Confirm Clock Out'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
