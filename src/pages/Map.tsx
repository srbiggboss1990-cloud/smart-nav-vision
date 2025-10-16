import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Satellite, Layers, AlertCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import AIAssistant from "@/components/AIAssistant";
import { supabase } from "@/integrations/supabase/client";

// Declare google maps types
declare const google: any;

const GOOGLE_MAPS_API_KEY = "AIzaSyDnImjn1Cgg5nJZn1ApfbjO7DZanWTpQ0g";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapStyle, setMapStyle] = useState<"roadmap" | "satellite">("roadmap");
  const [destination, setDestination] = useState("");
  const mapRef = useRef<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<any[]>([]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Dubai if location denied
          setUserLocation({ lat: 25.2048, lng: 55.2708 });
        }
      );
    } else {
      setUserLocation({ lat: 25.2048, lng: 55.2708 });
    }
  }, []);

  // Load Google Maps
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    
    script.onload = () => {
      try {
        mapRef.current = new google.maps.Map(mapContainer.current!, {
          center: userLocation,
          zoom: 13,
          mapTypeId: mapStyle,
          styles: mapStyle === "roadmap" ? [
            { featureType: "poi", stylers: [{ visibility: "off" }] }
          ] : undefined,
        });

        // Add traffic layer
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(mapRef.current);

        // Add user location marker
        new google.maps.Marker({
          position: userLocation,
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Your Location",
        });
        
        toast.success("Live traffic map loaded!");
        fetchTrafficData();
      } catch (error) {
        console.error("Map initialization error:", error);
        toast.error("Failed to initialize map");
      }
    };
    
    document.body.appendChild(script);

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [userLocation]);

  // Fetch traffic incidents
  const fetchTrafficData = async () => {
    if (!userLocation) return;

    try {
      const { data, error } = await supabase.functions.invoke('traffic-data', {
        body: { 
          lat: userLocation.lat, 
          lng: userLocation.lng,
          radius: 5000 
        }
      });

      if (error) throw error;

      if (data.success && data.incidents) {
        setIncidents(data.incidents);
        plotIncidents(data.incidents);
      }
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    }
  };

  // Plot incidents on map
  const plotIncidents = (incidents: any[]) => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    incidents.forEach((incident) => {
      const marker = new google.maps.Marker({
        position: incident.location,
        map: mapRef.current!,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: incident.severity === 'high' ? '#ef4444' : 
                     incident.severity === 'medium' ? '#f59e0b' : '#22c55e',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: incident.description,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${incident.description}</h3>
            <p style="font-size: 12px; color: #666;">Type: ${incident.type}</p>
            <p style="font-size: 12px; color: #666;">Distance: ${incident.distance.toFixed(2)} km</p>
            <p style="font-size: 12px; color: #666;">Severity: ${incident.severity}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current!, marker);
      });

      markersRef.current.push(marker);
    });
  };

  // Update incidents every 30 seconds
  useEffect(() => {
    if (!userLocation) return;

    const interval = setInterval(() => {
      fetchTrafficData();
    }, 30000);

    return () => clearInterval(interval);
  }, [userLocation]);

  useEffect(() => {
    if (mapRef.current && mapStyle) {
      mapRef.current.setMapTypeId(mapStyle);
    }
  }, [mapStyle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Searching route to: ${destination}`);
  };

  return (
    <>
      <AIAssistant />
      <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Traffic Map</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Real-time updates active</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mapStyle === "roadmap" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapStyle("roadmap")}
            className="transition-all duration-300"
          >
            <Layers className="h-4 w-4 mr-2" />
            Street
          </Button>
          <Button
            variant={mapStyle === "satellite" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapStyle("satellite")}
            className="transition-all duration-300"
          >
            <Satellite className="h-4 w-4 mr-2" />
            Satellite
          </Button>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter destination address..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="flex-1 transition-all duration-300 focus:shadow-glow"
          />
          <Button type="submit" className="bg-gradient-primary hover:opacity-90">
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6 lg:col-span-3 shadow-card">
          <div
            ref={mapContainer}
            className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center"
          >
            {!userLocation && (
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 mx-auto text-primary animate-pulse" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Loading Map</h3>
                  <p className="text-muted-foreground">
                    Initializing Google Maps with live traffic data...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-4">Traffic Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-success" />
                <span className="text-sm">Clear Roads</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-warning" />
                <span className="text-sm">Moderate Traffic</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-destructive" />
                <span className="text-sm">Heavy Congestion</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              Active Incidents
              <span className="text-xs text-muted-foreground">{incidents.length} nearby</span>
            </h3>
            <div className="space-y-3 text-sm max-h-[400px] overflow-y-auto">
              {incidents.length > 0 ? (
                incidents.slice(0, 5).map((incident) => (
                  <div 
                    key={incident.id}
                    className={`p-3 rounded-lg border ${
                      incident.severity === 'high' 
                        ? 'bg-destructive/10 border-destructive/20' 
                        : incident.severity === 'medium'
                        ? 'bg-warning/10 border-warning/20'
                        : 'bg-success/10 border-success/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className={`h-4 w-4 mt-0.5 ${
                        incident.severity === 'high' ? 'text-destructive' :
                        incident.severity === 'medium' ? 'text-warning' : 'text-success'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium ${
                          incident.severity === 'high' ? 'text-destructive' :
                          incident.severity === 'medium' ? 'text-warning' : 'text-success'
                        }`}>
                          {incident.description}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {incident.distance.toFixed(2)} km away • {incident.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No incidents nearby
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
