import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, CloudRain, Clock } from "lucide-react";

interface PredictiveAlert {
  id: string;
  type: "traffic" | "weather" | "accident";
  message: string;
  location: string;
  probability: number;
  timeframe: string;
  icon: any;
}

export function PredictiveAlerts() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);

  useEffect(() => {
    // Simulate predictive alerts based on patterns
    const generateAlerts = () => {
      const currentHour = new Date().getHours();
      const newAlerts: PredictiveAlert[] = [];

      // Rush hour traffic prediction
      if (currentHour >= 7 && currentHour <= 9) {
        newAlerts.push({
          id: "traffic-morning",
          type: "traffic",
          message: "Traffic likely to increase near Sheikh Zayed Road in 15 min due to morning rush",
          location: "Sheikh Zayed Road",
          probability: 85,
          timeframe: "Next 15 min",
          icon: TrendingUp,
        });
      }

      // Evening rush prediction
      if (currentHour >= 17 && currentHour <= 19) {
        newAlerts.push({
          id: "traffic-evening",
          type: "traffic",
          message: "Heavy congestion expected on Dubai-Sharjah Road based on historical patterns",
          location: "Dubai-Sharjah Road",
          probability: 90,
          timeframe: "Next 30 min",
          icon: TrendingUp,
        });
      }

      // Accident probability based on weather and time
      if (currentHour >= 22 || currentHour <= 5) {
        newAlerts.push({
          id: "accident-night",
          type: "accident",
          message: "Accident probability rising in Al Qusais based on historical trends and low visibility",
          location: "Al Qusais",
          probability: 65,
          timeframe: "Next hour",
          icon: AlertTriangle,
        });
      }

      // Weather-related predictions
      const weatherFactor = Math.random();
      if (weatherFactor > 0.7) {
        newAlerts.push({
          id: "weather-impact",
          type: "weather",
          message: "Rain expected to affect visibility and road conditions on major highways",
          location: "Major Highways",
          probability: 75,
          timeframe: "Next 2 hours",
          icon: CloudRain,
        });
      }

      setAlerts(newAlerts);
    };

    generateAlerts();
    const interval = setInterval(generateAlerts, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        const alertColor = 
          alert.type === "accident" ? "border-destructive bg-destructive/10" :
          alert.type === "weather" ? "border-warning bg-warning/10" :
          "border-primary bg-primary/10";
        
        const iconColor =
          alert.type === "accident" ? "text-destructive" :
          alert.type === "weather" ? "text-warning" :
          "text-primary";

        return (
          <Alert key={alert.id} className={`${alertColor} shadow-glow animate-fade-in`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <AlertDescription className="ml-2">
              <div className="space-y-1">
                <p className="font-semibold">{alert.message}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alert.timeframe}
                  </span>
                  <span>📍 {alert.location}</span>
                  <span className="font-medium text-foreground">{alert.probability}% probability</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
