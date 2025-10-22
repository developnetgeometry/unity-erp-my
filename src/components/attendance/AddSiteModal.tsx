import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast-api';
import { useCreateSite, useUpdateSite } from '@/hooks/useAttendance';
import { getCurrentPosition } from '@/lib/geolocation';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editSite?: any;
}

export function AddSiteModal({ isOpen, onClose, onSuccess, editSite }: AddSiteModalProps) {
  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('100');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const createSite = useCreateSite();
  const updateSite = useUpdateSite();

  useEffect(() => {
    if (editSite) {
      setSiteName(editSite.site_name || '');
      setAddress(editSite.address || '');
      setLatitude(editSite.latitude?.toString() || '');
      setLongitude(editSite.longitude?.toString() || '');
      setRadius(editSite.radius_meters?.toString() || '100');
    } else {
      // Reset form
      setSiteName('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setRadius('100');
    }
  }, [editSite, isOpen]);

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const position = await getCurrentPosition();
      setLatitude(position.latitude.toFixed(6));
      setLongitude(position.longitude.toFixed(6));
      toast.success('Location obtained successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const siteData = {
      site_name: siteName,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius_meters: parseInt(radius),
    };

    try {
      if (editSite) {
        await updateSite.mutateAsync({ ...siteData, id: editSite.id, is_active: editSite.is_active });
        toast.success('Site updated successfully');
      } else {
        await createSite.mutateAsync(siteData);
        toast.success('Site created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(editSite ? 'Failed to update site' : 'Failed to create site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
            <DialogDescription>
              {editSite ? 'Update the work site details' : 'Define a new office or client site location'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name *</Label>
              <Input
                id="site-name"
                placeholder="e.g., HQ Office, Client Site A"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter physical address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 3.1123"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 101.6684"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Radius (Meters) *</Label>
              <Input
                id="radius"
                type="number"
                min="50"
                max="500"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default: 100m (employees must be within this radius to clock in/out)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editSite ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editSite ? 'Update Site' : 'Create Site'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
