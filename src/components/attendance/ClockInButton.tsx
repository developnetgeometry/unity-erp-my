import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast-api';
import { useMySites, useClockIn } from '@/hooks/useAttendance';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/lib/geolocation';

interface ClockInButtonProps {
  onSuccess?: () => void;
}

export function ClockInButton({ onSuccess }: ClockInButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const { data: sites = [] } = useMySites();
  const { latitude, longitude, error, loading, requestLocation } = useGeolocation();
  const clockIn = useClockIn();

  const selectedSiteData = sites.find(s => s.id === selectedSite);
  const distance = selectedSiteData && latitude && longitude
    ? calculateDistance(latitude, longitude, selectedSiteData.latitude, selectedSiteData.longitude)
    : null;
  const isWithinRadius = distance !== null && distance <= (selectedSiteData?.radius_meters || 100);

  const handleOpenDialog = () => {
    setShowDialog(true);
    requestLocation();
  };

  const handleClockIn = async () => {
    if (!selectedSite || !latitude || !longitude) {
      toast.error('Please select a site and enable location');
      return;
    }

    if (!isWithinRadius) {
      toast.error(`You are ${formatDistance(distance!)} from the site. Must be within ${selectedSiteData?.radius_meters}m.`);
      return;
    }

    clockIn.mutate({
      site_id: selectedSite,
      latitude,
      longitude,
    }, {
      onSuccess: () => {
        toast.success('Clocked in successfully');
        setShowDialog(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to clock in');
      },
    });
  };

  return (
    <>
      <Button
        size="lg"
        className="w-full h-16 text-lg"
        onClick={handleOpenDialog}
      >
        <Clock className="h-5 w-5 mr-2" />
        Clock In
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Clock In</DialogTitle>
            <DialogDescription>
              Select your work site and verify your location
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Site Selection */}
            <div className="space-y-2">
              <Label htmlFor="site">Work Site *</Label>
              {sites.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border border-border rounded-md">
                  No sites assigned. Please contact HR to assign you to a work site.
                </div>
              ) : (
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger id="site">
                    <SelectValue placeholder="Select work site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{site.site_name}</span>
                          {site.is_primary && (
                            <span className="text-xs text-primary">(Primary)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                    {selectedSiteData && distance !== null && (
                      <div className="mt-2 pl-6">
                        <p className="text-muted-foreground">
                          Distance to site: <span className={isWithinRadius ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                            {formatDistance(distance)}
                          </span>
                        </p>
                        {!isWithinRadius && (
                          <p className="text-xs text-destructive mt-1">
                            Must be within {selectedSiteData.radius_meters}m to clock in
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
              onClick={handleClockIn}
              disabled={!selectedSite || !isWithinRadius || clockIn.isPending}
            >
              {clockIn.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clocking In...
                </>
              ) : (
                'Confirm Clock In'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
