import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ambulance, Radio, MapPin, Clock, AlertTriangle, CheckCircle2, AlertCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import AIAssistant from "@/components/AIAssistant";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface SOSAlert {
  id: string;
  user_name: string;
  issue_type: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  distance?: number;
}

interface SOSResponse {
  id: string;
  responder_name: string;
  response_type: string;
  message: string | null;
  created_at: string;
}

export default function Emergency() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [routeCleared, setRouteCleared] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [showSosDialog, setShowSosDialog] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [nearbyAlerts, setNearbyAlerts] = useState<SOSAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your location");
        }
      );
    }
  }, []);

  // Subscribe to nearby SOS alerts
  useEffect(() => {
    const fetchNearbyAlerts = async () => {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      if (data && userLocation) {
        // Calculate distances and sort by proximity
        const alertsWithDistance = data.map(alert => ({
          ...alert,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            alert.latitude,
            alert.longitude
          )
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setNearbyAlerts(alertsWithDistance);
      }
    };

    fetchNearbyAlerts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('sos-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_alerts'
        },
        () => {
          fetchNearbyAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sendSOS = async () => {
    if (!issueType) {
      toast.error("Please select an issue type");
      return;
    }

    if (!userLocation) {
      toast.error("Unable to get your location");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to send SOS");
      return;
    }

    const { error } = await supabase
      .from('sos_alerts')
      .insert({
        user_id: user.id,
        user_name: user.email?.split('@')[0] || 'Anonymous',
        issue_type: issueType,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        status: 'active'
      });

    if (error) {
      console.error('Error sending SOS:', error);
      toast.error("Failed to send SOS alert");
      return;
    }

    setSosActive(true);
    setShowSosDialog(false);
    toast.success("SOS Alert Sent!", {
      description: "Nearby users have been notified"
    });
  };

  const respondToAlert = async (alertId: string, responseType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to respond");
      return;
    }

    const { error } = await supabase
      .from('sos_responses')
      .insert({
        alert_id: alertId,
        responder_id: user.id,
        responder_name: user.email?.split('@')[0] || 'Anonymous',
        response_type: responseType,
        message: responseMessage || null
      });

    if (error) {
      console.error('Error responding:', error);
      toast.error("Failed to send response");
      return;
    }

    setSelectedAlert(null);
    setResponseMessage("");
    toast.success("Response sent successfully");
  };

  const toggleEmergencyMode = () => {
    const newMode = !emergencyMode;
    setEmergencyMode(newMode);
    
    if (newMode) {
      toast.success("Emergency Mode Activated", {
        description: "Broadcasting location to nearby drivers",
      });
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
    <>
      <AIAssistant />
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

      <Card className="shadow-card border-2 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Emergency SOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send instant alerts to nearby users and authorities in case of emergency
          </p>
          
          {sosActive ? (
            <div className="space-y-4">
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive font-semibold">
                  Your SOS alert is active - Help is on the way
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase
                      .from('sos_alerts')
                      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
                      .eq('user_id', user.id)
                      .eq('status', 'active');
                    setSosActive(false);
                    toast.success("SOS alert resolved");
                  }
                }}
                className="w-full"
              >
                Mark as Resolved
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowSosDialog(true)}
              className="w-full bg-gradient-danger hover:opacity-90 shadow-glow"
              size="lg"
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              Send SOS Alert
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Nearby SOS Alerts ({nearbyAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nearbyAlerts.length > 0 ? (
            <div className="space-y-3">
              {nearbyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{alert.user_name}</p>
                      <Badge variant="destructive">{alert.issue_type}</Badge>
                      <p className="text-sm text-muted-foreground">
                        {alert.distance ? `${alert.distance.toFixed(1)} km away` : 'Distance unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                      className="flex-1"
                    >
                      Respond
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToAlert(alert.id, 'report')}
                      className="flex-1"
                    >
                      Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No active SOS alerts nearby</p>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* SOS Dialog */}
      <Dialog open={showSosDialog} onOpenChange={setShowSosDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Emergency SOS</DialogTitle>
            <DialogDescription>
              Your location and details will be shared with nearby users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Issue Type</label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="breakdown">Vehicle Breakdown</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="danger">Road Danger</SelectItem>
                  <SelectItem value="other">Other Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={sendSOS} className="w-full bg-gradient-danger">
              Send SOS Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to SOS Alert</DialogTitle>
            <DialogDescription>
              Help {selectedAlert?.user_name} with their {selectedAlert?.issue_type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Let them know you're coming to help..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => selectedAlert && respondToAlert(selectedAlert.id, 'help_coming')}
                className="flex-1"
              >
                I'm Coming to Help
              </Button>
              <Button
                onClick={() => selectedAlert && respondToAlert(selectedAlert.id, 'contacted_authorities')}
                variant="secondary"
                className="flex-1"
              >
                Contacted Authorities
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
