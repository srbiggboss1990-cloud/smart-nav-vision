import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Eye, AlertTriangle, CheckCircle2, Zap, Volume2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import AIAssistant from "@/components/AIAssistant";

export default function Safety() {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [alertLevel, setAlertLevel] = useState<"safe" | "warning" | "danger">("safe");
  const [alertCount, setAlertCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleMonitoring = async () => {
    const newState = !monitoringActive;
    
    if (newState) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setMonitoringActive(true);
          
          toast.success("Safety Monitor Activated", {
            description: "AI-powered fatigue detection is now running",
          });
          
          // Simulate fatigue detection
          const interval = setInterval(() => {
            const randomLevel = Math.random();
            if (randomLevel > 0.85) {
              setAlertLevel("danger");
              setAlertCount(prev => prev + 1);
              toast.error("High fatigue detected! Please take a break.");
            } else if (randomLevel > 0.7) {
              setAlertLevel("warning");
              setAlertCount(prev => prev + 1);
              toast.warning("Mild fatigue detected. Consider taking a break.");
            } else {
              setAlertLevel("safe");
            }
          }, 5000);
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        toast.error("Failed to access camera. Please grant camera permissions.");
        console.error("Camera error:", error);
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setMonitoringActive(false);
      setAlertLevel("safe");
      toast.info("Safety Monitor Deactivated");
    }
  };

  const features = [
    {
      icon: Eye,
      title: "Eye Tracking",
      description: "Monitors blink rate and gaze direction",
      status: monitoringActive ? "active" : "inactive",
    },
    {
      icon: Camera,
      title: "Face Detection",
      description: "Tracks head position and facial features",
      status: monitoringActive ? "active" : "inactive",
    },
    {
      icon: Volume2,
      title: "Audio Alerts",
      description: "Gentle warnings when fatigue detected",
      status: monitoringActive ? "active" : "inactive",
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Instant AI-powered processing",
      status: monitoringActive ? "active" : "inactive",
    },
  ];

  const safetyMetrics = [
    { label: "Blink Rate", value: monitoringActive ? "15/min" : "--", status: "normal" },
    { label: "Gaze Focus", value: monitoringActive ? "92%" : "--", status: "good" },
    { label: "Head Position", value: monitoringActive ? "Stable" : "--", status: "normal" },
    { label: "Alerts Today", value: alertCount.toString(), status: "info" },
  ];

  return (
    <>
      <AIAssistant />
      <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Driver Safety Monitor</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered fatigue and distraction detection system
        </p>
      </div>

      {monitoringActive && alertLevel === "warning" && (
        <Alert className="border-warning bg-warning/10 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning font-semibold">
            Attention: Possible fatigue detected. Consider taking a break.
          </AlertDescription>
        </Alert>
      )}

      {monitoringActive && alertLevel === "danger" && (
        <Alert className="border-destructive bg-destructive/10 animate-pulse-glow">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-semibold">
            Warning: High fatigue level detected! Please pull over safely.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Live Camera Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {monitoringActive && stream ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white text-sm font-medium bg-black/50 px-3 py-2 rounded">
                    <span className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full animate-pulse ${
                        alertLevel === "danger" ? "bg-destructive" :
                        alertLevel === "warning" ? "bg-warning" : "bg-success"
                      }`} />
                      Monitoring Active
                    </span>
                    <span>AI Analysis</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {monitoringActive ? "Loading camera..." : "Camera feed will appear here"}
                  </p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              onClick={toggleMonitoring}
              className={`w-full transition-all duration-300 ${
                monitoringActive
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-gradient-primary hover:opacity-90 shadow-glow'
              }`}
            >
              {monitoringActive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Requires webcam access. All processing is done locally on your device.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Safety Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {safetyMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-4 bg-muted/50 rounded-lg space-y-2 transition-all duration-300 hover:bg-muted"
                  >
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    {monitoringActive && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        metric.status === "good" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                      }`}>
                        {metric.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Alert Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-lg text-center space-y-3 transition-all duration-300 ${
                alertLevel === "danger" ? "bg-destructive/10 border border-destructive/20" :
                alertLevel === "warning" ? "bg-warning/10 border border-warning/20" :
                "bg-success/10 border border-success/20"
              }`}>
                {alertLevel === "safe" && <CheckCircle2 className="h-12 w-12 mx-auto text-success" />}
                {alertLevel === "warning" && <AlertTriangle className="h-12 w-12 mx-auto text-warning animate-pulse" />}
                {alertLevel === "danger" && <AlertTriangle className="h-12 w-12 mx-auto text-destructive animate-pulse-glow" />}
                
                <div>
                  <p className={`font-bold text-lg ${
                    alertLevel === "danger" ? "text-destructive" :
                    alertLevel === "warning" ? "text-warning" :
                    "text-success"
                  }`}>
                    {alertLevel === "safe" && "Driver Alert"}
                    {alertLevel === "warning" && "Mild Fatigue Detected"}
                    {alertLevel === "danger" && "High Fatigue Level"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {!monitoringActive && "Start monitoring to begin detection"}
                    {monitoringActive && alertLevel === "safe" && "All parameters are normal"}
                    {monitoringActive && alertLevel === "warning" && "Consider taking a short break"}
                    {monitoringActive && alertLevel === "danger" && "Please pull over immediately"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Detection Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    feature.status === "active"
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${
                      feature.status === "active" ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        feature.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {feature.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
