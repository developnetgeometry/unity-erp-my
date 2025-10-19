import { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, FlipHorizontal, Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (image: { base64: string; file: File }) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [lightingQuality, setLightingQuality] = useState<'poor' | 'fair' | 'good'>('fair');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setHasPermission(true);
      
      // Simulate lighting quality detection (in real app, analyze video frames)
      setTimeout(() => setLightingQuality('good'), 1000);
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;

    // Convert base64 to File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture({ base64: capturedImage, file });
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (hasPermission === false) {
    return (
      <Card className="p-6 text-center space-y-4">
        <div className="text-destructive">
          <X className="w-12 h-12 mx-auto mb-2" />
          <h3 className="font-semibold">Camera Access Denied</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Please enable camera access in your browser settings to capture receipts.
          </p>
        </div>
        <div className="space-y-2">
          <Button onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload from Gallery Instead
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </Card>
    );
  }

  if (capturedImage) {
    return (
      <div className="relative w-full h-full min-h-[70vh] bg-black">
        <img src={capturedImage} alt="Captured receipt" className="w-full h-full object-contain" />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2 max-w-md mx-auto">
            <Button variant="outline" onClick={retakePhoto} className="flex-1">
              Retake
            </Button>
            <Button onClick={confirmPhoto} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Use Photo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[70vh] bg-black overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Overlay Guide */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md aspect-[3/4] border-2 border-white/50 rounded-lg">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
            
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white text-sm font-medium drop-shadow-lg">
                Center receipt, avoid shadows
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lighting Quality Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <Badge
          variant="secondary"
          className={cn(
            'text-white border-none',
            lightingQuality === 'poor' && 'bg-red-500',
            lightingQuality === 'fair' && 'bg-amber-500',
            lightingQuality === 'good' && 'bg-green-500'
          )}
        >
          {lightingQuality === 'poor' && '🔴 Too dark'}
          {lightingQuality === 'fair' && '🟡 OK lighting'}
          {lightingQuality === 'good' && '🟢 Perfect lighting'}
        </Badge>
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={flipCamera}
          className="bg-black/50 backdrop-blur hover:bg-black/70"
        >
          <FlipHorizontal className="w-5 h-5 text-white" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onCancel}
          className="bg-black/50 backdrop-blur hover:bg-black/70"
        >
          <X className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="text-white hover:bg-white/20"
          >
            <Upload className="w-6 h-6" />
          </Button>

          <Button
            size="icon"
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-4 border-white/50 hover:bg-white/90"
          >
            <Camera className="w-8 h-8 text-black" />
          </Button>

          <div className="w-6 h-6" /> {/* Spacer for symmetry */}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
