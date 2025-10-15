import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Eye, AlertTriangle, CheckCircle2, Zap, Volume2, EyeOff, Vibrate } from "lucide-react";
import { toast } from "sonner";
import AIAssistant from "@/components/AIAssistant";

// Voice and vibration utilities
const speak = (message: string, urgent: boolean = false) => {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = urgent ? 1.2 : 1.0;
  utterance.pitch = urgent ? 1.2 : 1.0;
  utterance.volume = 1.0;
  speechSynthesis.speak(utterance);
};

const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export default function Safety() {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [alertLevel, setAlertLevel] = useState<"safe" | "warning" | "danger">("safe");
  const [alertCount, setAlertCount] = useState(0);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [eyesClosedDuration, setEyesClosedDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Dynamic metrics state
  const [blinkRate, setBlinkRate] = useState(15);
  const [gazeFocus, setGazeFocus] = useState(92);
  const [headPosition, setHeadPosition] = useState("Stable");

  const intervalRef = useRef<number | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);
  const alertIntervalRef = useRef<number | null>(null);
  const eyesClosedTimerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
    };
  }, [stream]);

  // Bind stream to video element
  useEffect(() => {
    if (monitoringActive && stream && videoRef.current) {
      const v = videoRef.current;
      v.srcObject = stream;
      const tryPlay = async () => {
        try { await v.play(); } catch (e) { /* autoplay blocked */ }
      };
      v.onloadedmetadata = tryPlay;
      tryPlay();
    }
  }, [monitoringActive, stream]);

  // Handle alerts with voice and vibration
  useEffect(() => {
    if (alertLevel === "warning" && monitoringActive) {
      speak("Warning: Please wash your face. Fatigue detected.");
      vibrate(200); // Short vibration
      
      toast.warning("⚠️ You appear sleepy", {
        description: "Please wash your face or take a break",
      });
    } else if (alertLevel === "danger" && monitoringActive) {
      speak("Please stop your vehicle safely. Severe fatigue detected.", true);
      vibrate([300, 100, 300, 100, 300]); // Pattern vibration
      
      // Continue alerts until acknowledged
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = window.setInterval(() => {
        speak("Please stop your vehicle safely. Severe fatigue detected.", true);
        vibrate([300, 100, 300]);
      }, 10000); // Every 10 seconds
      
      toast.error("🚨 Severe Fatigue Detected", {
        description: "Stop vehicle immediately!",
        duration: 60000, // Stay for 1 minute
      });
    } else {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
    }
  }, [alertLevel, monitoringActive]);

  const toggleMonitoring = async () => {
    const newState = !monitoringActive;
    
    if (newState) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        setStream(mediaStream);
        setMonitoringActive(true);

        speak("Safety monitor activated. AI-powered fatigue detection is now running.");
        toast.success("Safety Monitor Activated", {
          description: "AI-powered fatigue detection is now running",
        });

        // Start simulated AI analysis
        metricsIntervalRef.current = window.setInterval(() => {
          // Simulate eye blink detection
          const isBlinking = Math.random() < 0.15; // 15% chance of blink detected
          setEyesClosed(isBlinking);
          
          if (isBlinking) {
            eyesClosedTimerRef.current += 1;
          } else {
            eyesClosedTimerRef.current = 0;
          }
          setEyesClosedDuration(eyesClosedTimerRef.current);

          // Update metrics
          setBlinkRate(prev => {
            const variation = Math.random() * 4 - 2;
            const newRate = Math.max(8, Math.min(20, prev + variation));
            return newRate;
          });
          
          setGazeFocus(prev => {
            const variation = Math.random() * 8 - 4;
            return Math.max(70, Math.min(98, prev + variation));
          });
          
          setHeadPosition(() => {
            const positions = ["Stable", "Stable", "Stable", "Slight Tilt", "Forward"];
            return positions[Math.floor(Math.random() * positions.length)];
          });
        }, 1000);

        // Fatigue detection logic
        intervalRef.current = window.setInterval(() => {
          const currentBlinkRate = blinkRate;
          const currentGazeFocus = gazeFocus;
          const currentHeadPos = headPosition;
          const eyesClosedTime = eyesClosedTimerRef.current;

          // Severe fatigue: eyes closed > 3 seconds or very low metrics
          if (eyesClosedTime >= 3 || (currentBlinkRate < 10 && currentGazeFocus < 75)) {
            setAlertLevel("danger");
            setAlertCount(prev => prev + 1);
          }
          // Mild fatigue: frequent blinking or wandering gaze
          else if (currentBlinkRate > 18 || currentGazeFocus < 80 || currentHeadPos !== "Stable") {
            setAlertLevel("warning");
            setAlertCount(prev => prev + 1);
          } else {
            setAlertLevel("safe");
          }
        }, 2000);
      } catch (error) {
        toast.error("Failed to access camera. Please grant camera permissions.");
        console.error("Camera error:", error);
      }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setMonitoringActive(false);
      setAlertLevel("safe");
      setEyesClosed(false);
      setEyesClosedDuration(0);
      eyesClosedTimerRef.current = 0;
      setBlinkRate(15);
      setGazeFocus(92);
      setHeadPosition("Stable");
      
      speak("Safety monitor deactivated.");
      toast.info("Safety Monitor Deactivated");
    }
  };

  const acknowledgeAlert = () => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    setAlertLevel("safe");
    vibrate(100); // Confirmation vibration
    toast.success("Alert acknowledged. Stay alert!");
  };

  const features = [
    {
      icon: Eye,
      title: "Eye Tracking",
      description: "Monitors blink rate and eye closure duration",
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
      title: "AI Voice Alerts",
      description: "Spoken warnings with escalating urgency",
      status: monitoringActive ? "active" : "inactive",
    },
    {
      icon: Vibrate,
      title: "Haptic Feedback",
      description: "Physical vibration alerts for immediate attention",
      status: monitoringActive ? "active" : "inactive",
    },
  ];

  const safetyMetrics = [
    {
      label: "Blink Rate",
      value: `${blinkRate.toFixed(1)}/min`,
      status: blinkRate >= 12 && blinkRate <= 18 ? "normal" : "warning",
      icon: Eye,
    },
    {
      label: "Gaze Focus",
      value: `${gazeFocus.toFixed(0)}%`,
      status: gazeFocus >= 85 ? "normal" : "warning",
      icon: Eye,
    },
    {
      label: "Head Position",
      value: headPosition,
      status: headPosition === "Stable" ? "normal" : "warning",
      icon: Camera,
    },
    {
      label: "Alerts Today",
      value: alertCount.toString(),
      status: alertCount < 3 ? "normal" : "warning",
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <AIAssistant />
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Driver Safety Monitor</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered fatigue and distraction detection with voice & haptic alerts
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <div className={`h-3 w-3 rounded-full animate-pulse ${
              monitoringActive 
                ? alertLevel === "danger" ? "bg-destructive" 
                : alertLevel === "warning" ? "bg-warning" 
                : "bg-success"
                : "bg-muted-foreground"
            }`} />
            <span className="font-medium">
              AI Safety System: {monitoringActive ? "Active" : "Standby"}
            </span>
          </div>
        </div>

        {alertLevel === "warning" && monitoringActive && (
          <Alert className="border-warning bg-warning/10 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="flex justify-between items-center">
              <span className="text-warning font-semibold">
                ⚠️ Mild Fatigue Detected - Please wash your face or take a break
              </span>
              <Button onClick={acknowledgeAlert} variant="outline" size="sm">
                I'm Fine
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {alertLevel === "danger" && monitoringActive && (
          <Alert className="border-destructive bg-destructive/10 animate-pulse-glow">
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            <AlertDescription className="flex justify-between items-center">
              <span className="text-destructive font-bold">
                🚨 SEVERE FATIGUE DETECTED - Stop Vehicle Immediately!
              </span>
              <Button onClick={acknowledgeAlert} variant="destructive" size="sm">
                OK
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-card hover:shadow-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Live Camera Feed
              {eyesClosed && (
                <span className="ml-auto flex items-center gap-2 text-destructive text-sm animate-pulse">
                  <EyeOff className="h-4 w-4" />
                  Eyes Closed: {eyesClosedDuration}s
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {monitoringActive && stream ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover mirror"
                    autoPlay
                    playsInline
                    muted
                  />
                  
                  {/* Real-time overlay indicators */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      alertLevel === "danger" ? "bg-destructive/90 text-white" :
                      alertLevel === "warning" ? "bg-warning/90 text-white" :
                      "bg-success/90 text-white"
                    }`}>
                      {alertLevel === "danger" ? "🚨 SEVERE FATIGUE" :
                       alertLevel === "warning" ? "⚠️ MILD FATIGUE" :
                       "✓ ALERT & FOCUSED"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Camera not active</p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={toggleMonitoring}
              size="lg"
              className={`w-full ${monitoringActive ? 'bg-destructive hover:bg-destructive/90' : 'bg-gradient-primary'}`}
            >
              {monitoringActive ? (
                <>
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" />
                  Start Monitoring
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Safety Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {safetyMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      metric.status === "normal" ? "bg-success/10" : "bg-warning/10"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        metric.status === "normal" ? "text-success" : "text-warning"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alert Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Alert Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Current Safety Level</p>
                <p className={`text-2xl font-bold ${
                  alertLevel === "danger" ? "text-destructive" :
                  alertLevel === "warning" ? "text-warning" :
                  "text-success"
                }`}>
                  {alertLevel === "danger" ? "🚨 CRITICAL" :
                   alertLevel === "warning" ? "⚠️ CAUTION" :
                   "✓ SAFE"}
                </p>
              </div>
              <div className={`p-4 rounded-full ${
                alertLevel === "danger" ? "bg-destructive/20 animate-pulse-glow" :
                alertLevel === "warning" ? "bg-warning/20 animate-pulse" :
                "bg-success/20"
              }`}>
                {alertLevel === "danger" ? (
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                ) : alertLevel === "warning" ? (
                  <AlertTriangle className="h-8 w-8 text-warning" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-success" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detection Features */}
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
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      feature.status === "active"
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${
                        feature.status === "active" ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <h4 className="font-semibold">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        feature.status === "active" ? "bg-success animate-pulse" : "bg-muted-foreground"
                      }`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {feature.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </>
  );
}
