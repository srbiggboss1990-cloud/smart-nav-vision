import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ambulance, Radio, MapPin, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Emergency() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [routeCleared, setRouteCleared] = useState(false);

  const toggleEmergencyMode = () => {
    const newMode = !emergencyMode;
    setEmergencyMode(newMode);
    
    if (newMode) {
      toast.success("Emergency Mode Activated", {
        description: "Broadcasting location to nearby drivers",
      });
      // Simulate route clearing after 2 seconds
      setTimeout(() => setRouteCleared(true), 2000);
    } else {
      toast.info("Emergency Mode Deactivated");
      setRouteCleared(false);
    }
  };

  const nearbyVehicles = [
    { id: 1, distance: "0.2 mi", direction: "Ahead", status: "cleared" },
    { id: 2, distance: "0.5 mi", direction: "Behind", status: "alerted" },
    { id: 3, distance: "0.3 mi", direction: "Left lane", status: "cleared" },
    { id: 4, distance: "0.8 mi", direction: "Ahead", status: "alerted" },
  ];

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emergency Response Mode</h1>
        <p className="text-muted-foreground mt-2">
          Priority routing system for emergency vehicles
        </p>
      </div>

      {emergencyMode && (
        <Alert className="border-destructive bg-destructive/10 animate-pulse-glow">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-semibold">
            Emergency Mode Active - Broadcasting to nearby vehicles
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ambulance className="h-5 w-5 text-destructive" />
              Emergency Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                emergencyMode 
                  ? 'bg-gradient-danger shadow-glow animate-pulse-glow' 
                  : 'bg-muted'
              }`}>
                <Ambulance className={`h-16 w-16 transition-colors duration-300 ${
                  emergencyMode ? 'text-white' : 'text-muted-foreground'
                }`} />
              </div>

              <Button
                size="lg"
                onClick={toggleEmergencyMode}
                className={`w-full text-lg transition-all duration-300 ${
                  emergencyMode
                    ? 'bg-muted hover:bg-muted/80 text-foreground'
                    : 'bg-gradient-danger hover:opacity-90 shadow-glow'
                }`}
              >
                {emergencyMode ? 'Deactivate Emergency Mode' : 'Activate Emergency Mode'}
              </Button>
            </div>

            {emergencyMode && (
              <div className="space-y-3 animate-scale-in">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                  <Radio className="h-5 w-5 text-success animate-pulse" />
                  <div className="flex-1">
                    <p className="font-medium text-success">Broadcasting Signal</p>
                    <p className="text-sm text-muted-foreground">Active on all channels</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Location Sharing</p>
                    <p className="text-sm text-muted-foreground">Real-time GPS tracking</p>
                  </div>
                </div>

                {routeCleared && (
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20 animate-scale-in">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <div className="flex-1">
                      <p className="font-medium text-success">Route Cleared</p>
                      <p className="text-sm text-muted-foreground">Priority path established</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Nearby Vehicles Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencyMode ? (
              <div className="space-y-3">
                {nearbyVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        vehicle.status === 'cleared' ? 'bg-success' : 'bg-warning'
                      } animate-pulse`} />
                      <div>
                        <p className="font-medium">{vehicle.direction}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.distance} away</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      vehicle.status === 'cleared' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {vehicle.status === 'cleared' ? 'Cleared' : 'Alerted'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Activate emergency mode to see nearby vehicles
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Emergency Mode Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <Radio className="h-6 w-6 text-primary" />
              <h4 className="font-semibold">Real-time Broadcasting</h4>
              <p className="text-sm text-muted-foreground">
                Automatically alerts nearby drivers to clear the route
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <MapPin className="h-6 w-6 text-accent" />
              <h4 className="font-semibold">Priority Routing</h4>
              <p className="text-sm text-muted-foreground">
                AI-optimized path with traffic signal coordination
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <h4 className="font-semibold">Instant Verification</h4>
              <p className="text-sm text-muted-foreground">
                Real-time confirmation when path is cleared
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
