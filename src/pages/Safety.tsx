import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Eye, AlertTriangle, CheckCircle2, Zap, Volume2 } from "lucide-react";
import { toast } from "sonner";
import AIAssistant from "@/components/AIAssistant";

export default function Safety() {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [alertLevel, setAlertLevel] = useState<"safe" | "warning" | "danger">("safe");

  const toggleMonitoring = () => {
    const newState = !monitoringActive;
    setMonitoringActive(newState);
    
    if (newState) {
      toast.success("Safety Monitor Activated", {
        description: "AI-powered fatigue detection is now running",
      });
      // Simulate random alert changes
      const interval = setInterval(() => {
        const levels: Array<"safe" | "warning" | "danger"> = ["safe", "safe", "safe", "warning", "safe"];
        setAlertLevel(levels[Math.floor(Math.random() * levels.length)]);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      toast.info("Safety Monitor Deactivated");
      setAlertLevel("safe");
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
    { label: "Attention Level", value: monitoringActive ? "High" : "--", status: "good" },
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
              {monitoringActive ? (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-48 h-48 rounded-full border-4 transition-colors duration-300 ${
                      alertLevel === "danger" ? "border-destructive" :
                      alertLevel === "warning" ? "border-warning" :
                      "border-success"
                    } animate-pulse-glow`}>
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className={`h-16 w-16 ${
                          alertLevel === "danger" ? "text-destructive" :
                          alertLevel === "warning" ? "text-warning" :
                          "text-success"
                        }`} />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Monitoring Active
                    </span>
                    <span>Using TensorFlow.js FaceMesh</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Camera feed will appear here</p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              onClick={toggleMonitoring}
              className={`w-full transition-all duration-300 ${
                monitoringActive
                  ? 'bg-muted hover:bg-muted/80 text-foreground'
                  : 'bg-gradient-primary hover:opacity-90 shadow-glow'
              }`}
            >
              {monitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
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
