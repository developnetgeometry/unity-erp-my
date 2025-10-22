import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast-api';
import { useClockOut } from '@/hooks/useAttendance';
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

  const distance = latitude && longitude
    ? calculateDistance(latitude, longitude, siteLatitude, siteLongitude)
    : null;
  const isWithinRadius = distance !== null && distance <= siteRadius;

  // Calculate hours worked so far
  const hoursWorked = clockInTime
    ? ((new Date().getTime() - new Date(clockInTime).getTime()) / (1000 * 60 * 60)).toFixed(1)
    : '0';

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
              disabled={!isWithinRadius || clockOut.isPending}
            >
              {clockOut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clocking Out...
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
