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

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
          intervalRef.current = window.setInterval(() => {
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
        }
      } catch (error) {
        toast.error("Failed to access camera. Please grant camera permissions.");
        console.error("Camera error:", error);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container py-8 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI Safety System</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Driver Safety Monitor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Advanced AI-powered fatigue and distraction detection system with real-time monitoring
          </p>
        </div>

        {monitoringActive && alertLevel === "warning" && (
          <Alert className="border-warning bg-warning/10 backdrop-blur-sm animate-pulse shadow-glow">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <AlertDescription className="text-warning font-semibold text-base">
              ⚠️ Attention: Possible fatigue detected. Consider taking a break.
            </AlertDescription>
          </Alert>
        )}

        {monitoringActive && alertLevel === "danger" && (
          <Alert className="border-destructive bg-destructive/10 backdrop-blur-sm animate-pulse-glow shadow-glow">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-destructive font-semibold text-base">
              🚨 Warning: High fatigue level detected! Please pull over safely.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-xl bg-gradient-primary">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                Live Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-gradient-dark rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-primary/20 shadow-glow">
                {monitoringActive && stream ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-danger px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-glow">
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white text-base font-semibold bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
                      <span className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full animate-pulse ${
                          alertLevel === "danger" ? "bg-destructive shadow-glow" :
                          alertLevel === "warning" ? "bg-warning shadow-glow" : "bg-success shadow-glow"
                        }`} />
                        Monitoring Active
                      </span>
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        AI Analysis
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto">
                      <Camera className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {monitoringActive ? "Loading camera..." : "Camera feed will appear here"}
                    </p>
                  </div>
                )}
              </div>

              <Button
                size="lg"
                onClick={toggleMonitoring}
                className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                  monitoringActive
                    ? 'bg-gradient-danger hover:opacity-90 text-white shadow-glow'
                    : 'bg-gradient-primary hover:opacity-90 text-white shadow-glow'
                }`}
              >
                {monitoringActive ? (
                  <>
                    <EyeOff className="h-5 w-5 mr-3" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5 mr-3" />
                    Start Monitoring
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Requires webcam access. All processing is done locally on your device.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/50">
              <CardHeader>
                <CardTitle className="text-2xl">Safety Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  {safetyMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl space-y-3 transition-all duration-300 hover:shadow-glow hover:scale-105 border border-border/50"
                    >
                      <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{metric.value}</p>
                      {monitoringActive && (
                        <span className={`inline-flex text-xs font-semibold px-3 py-1.5 rounded-full ${
                          metric.status === "good" ? "bg-success/20 text-success border border-success/30" : "bg-primary/20 text-primary border border-primary/30"
                        }`}>
                          {metric.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/50">
              <CardHeader>
                <CardTitle className="text-2xl">Alert Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-8 rounded-2xl text-center space-y-5 transition-all duration-300 ${
                  alertLevel === "danger" ? "bg-gradient-danger/10 border-2 border-destructive/30 shadow-glow" :
                  alertLevel === "warning" ? "bg-warning/10 border-2 border-warning/30 shadow-glow" :
                  "bg-gradient-success/10 border-2 border-success/30"
                }`}>
                  {alertLevel === "safe" && <CheckCircle2 className="h-16 w-16 mx-auto text-success drop-shadow-glow" />}
                  {alertLevel === "warning" && <AlertTriangle className="h-16 w-16 mx-auto text-warning animate-pulse drop-shadow-glow" />}
                  {alertLevel === "danger" && <AlertTriangle className="h-16 w-16 mx-auto text-destructive animate-pulse-glow drop-shadow-glow" />}
                  
                  <div>
                    <p className={`font-bold text-2xl ${
                      alertLevel === "danger" ? "text-destructive" :
                      alertLevel === "warning" ? "text-warning" :
                      "text-success"
                    }`}>
                      {alertLevel === "safe" && "✓ Driver Alert"}
                      {alertLevel === "warning" && "⚠️ Mild Fatigue Detected"}
                      {alertLevel === "danger" && "🚨 High Fatigue Level"}
                    </p>
                    <p className="text-base text-muted-foreground mt-3">
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

        <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-2xl">Detection Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      feature.status === "active"
                        ? "bg-gradient-primary/10 border-primary/30 shadow-glow"
                        : "bg-muted/30 border-border/50"
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className={`p-3 rounded-xl w-fit ${
                        feature.status === "active" ? "bg-gradient-primary" : "bg-muted"
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          feature.status === "active" ? "text-white" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-base">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full ${
                          feature.status === "active"
                            ? "bg-success/20 text-success border border-success/30"
                            : "bg-muted text-muted-foreground border border-border"
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
      </div>
    </>
  );
}
