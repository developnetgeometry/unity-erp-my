import { useState, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOTClockOut } from '@/hooks/useAttendance';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from '@/lib/toast-api';
import { differenceInSeconds, format } from 'date-fns';

interface OTClockOutButtonProps extends Omit<ButtonProps, 'onClick'> {
  otSessionId: string;
  otInTime: string;
  siteId: string;
  onSuccess?: () => void;
}

export function OTClockOutButton({
  otSessionId,
  otInTime,
  siteId,
  onSuccess,
  variant = 'destructive',
  size = 'default',
  ...props
}: OTClockOutButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [projectedHours, setProjectedHours] = useState(0);

  const otClockOut = useOTClockOut();
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = differenceInSeconds(new Date(), new Date(otInTime));
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
      setProjectedHours(Number((seconds / 3600).toFixed(2)));
    }, 1000);

    return () => clearInterval(interval);
  }, [otInTime]);

  useEffect(() => {
    if (isDialogOpen) {
      requestLocation();
    }
  }, [isDialogOpen]);

  const handleOTClockOut = async () => {
    if (geoError) {
      toast.error(geoError);
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Location not available');
      return;
    }

    try {
      await otClockOut.mutateAsync({
        latitude: latitude,
        longitude: longitude,
      });

      toast.success(`OT clock-out successful! Total OT: ${projectedHours.toFixed(2)} hours`);
      setIsDialogOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock out from overtime');
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        {...props}
      >
        <Clock className="mr-2 h-4 w-4" />
        Clock Out from OT
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Overtime Session</DialogTitle>
            <DialogDescription>
              Confirm you want to clock out from overtime
            </DialogDescription>
          </DialogHeader>

          {geoError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{geoError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">OT Started:</span>
                <span className="font-medium">{format(new Date(otInTime), 'h:mm a')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Elapsed Time:</span>
                <span className="font-mono text-lg font-bold">{elapsedTime}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Projected OT Hours:</span>
                <span className="text-lg font-bold text-primary">{projectedHours.toFixed(2)} hrs</span>
              </div>
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
              disabled={otClockOut.isPending || geoLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleOTClockOut}
              disabled={otClockOut.isPending || geoLoading || !latitude || !longitude}
            >
              {(otClockOut.isPending || geoLoading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {geoLoading ? 'Getting Location...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Confirm Clock Out
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
