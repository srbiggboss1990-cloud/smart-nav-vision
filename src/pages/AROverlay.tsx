import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Navigation, AlertTriangle, ArrowRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ARMarker {
  id: string;
  type: "direction" | "warning" | "info";
  text: string;
  x: number;
  y: number;
  distance: string;
}

export default function AROverlay() {
  const [arActive, setArActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const [markers, setMarkers] = useState<ARMarker[]>([]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (arActive) {
      // Simulate AR markers appearing at different positions
      const interval = setInterval(() => {
        setMarkers([
          {
            id: "1",
            type: "direction",
            text: "Turn right in 500m",
            x: 70,
            y: 40,
            distance: "500m",
          },
          {
            id: "2",
            type: "warning",
            text: "Heavy traffic ahead",
            x: 50,
            y: 60,
            distance: "1.2km",
          },
          {
            id: "3",
            type: "info",
            text: "Speed limit 45 mph",
            x: 30,
            y: 30,
            distance: "200m",
          },
        ]);
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setMarkers([]);
    }
  }, [arActive]);

  const startAR = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setArActive(true);
      toast({
        title: "AR Mode Activated",
        description: "Point your camera at the road to see navigation overlays",
      });
    } catch (error) {
      console.error("AR camera error:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopAR = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setArActive(false);
    setMarkers([]);
    toast({
      title: "AR Mode Deactivated",
    });
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "direction":
        return <ArrowRight className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return <Navigation className="h-5 w-5" />;
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "direction":
        return "bg-primary/90 text-primary-foreground border-primary";
      case "warning":
        return "bg-destructive/90 text-destructive-foreground border-destructive";
      case "info":
        return "bg-success/90 text-success-foreground border-success";
      default:
        return "bg-muted/90 text-foreground border-border";
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AR Navigation Overlay</h1>
        <p className="text-muted-foreground mt-2">
          Experience next-generation navigation with augmented reality
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            AR Camera View
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {arActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                
                {/* AR Overlays */}
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className={`absolute ${getMarkerColor(marker.type)} 
                      px-4 py-2 rounded-lg border-2 backdrop-blur-sm 
                      shadow-glow animate-pulse flex items-center gap-2
                      transition-all duration-300 hover:scale-110`}
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {getMarkerIcon(marker.type)}
                    <div>
                      <p className="text-sm font-semibold">{marker.text}</p>
                      <p className="text-xs opacity-80">{marker.distance}</p>
                    </div>
                  </div>
                ))}

                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 border-2 border-primary rounded-full opacity-50"></div>
                  <div className="absolute w-12 h-0.5 bg-primary opacity-50"></div>
                  <div className="absolute w-0.5 h-12 bg-primary opacity-50"></div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">AR mode not active</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Start AR mode to see navigation arrows, safety alerts, and directions
                    overlaid on your real-world view
                  </p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            {!arActive ? (
              <Button onClick={startAR} className="flex-1" size="lg">
                <Camera className="mr-2 h-5 w-5" />
                Start AR Mode
              </Button>
            ) : (
              <Button onClick={stopAR} variant="destructive" className="flex-1" size="lg">
                Stop AR Mode
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-card hover:shadow-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Smart Directions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              See turn-by-turn navigation arrows overlaid directly on your view of the road
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Real-Time Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get instant alerts about hazards, traffic, and road conditions ahead
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-success" />
              Contextual Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View speed limits, points of interest, and safety information in real-time
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Future Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                This AR overlay feature demonstrates the next generation of navigation technology.
                Future updates will include GPS integration, real-time object detection, and
                advanced route visualization using WebXR APIs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
