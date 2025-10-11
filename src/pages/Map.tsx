import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Satellite, Layers, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AIAssistant from "@/components/AIAssistant";

const TOMTOM_API_KEY = "7e5bf4b9-c4bd-4a84-8b99-8ce536ce8e0f";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
  const [destination, setDestination] = useState("");
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Load TomTom SDK
    const script = document.createElement('script');
    script.src = `https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js`;
    script.async = true;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css';
    
    document.head.appendChild(link);
    
    script.onload = () => {
      try {
        // @ts-ignore
        const tt = window.tt;
        
        mapRef.current = tt.map({
          key: TOMTOM_API_KEY,
          container: mapContainer.current,
          center: [-74.006, 40.7128], // New York
          zoom: 12,
          style: mapStyle === "satellite" ? "satellite" : "basic_main"
        });

        // Add traffic flow
        mapRef.current.showTrafficFlow();
        
        toast.success("Live traffic map loaded!");
      } catch (error) {
        console.error("Map initialization error:", error);
        toast.error("Failed to initialize map");
      }
    };
    
    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapStyle) {
      mapRef.current.setStyle(mapStyle === "satellite" ? "satellite" : "basic_main");
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
            variant={mapStyle === "street" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapStyle("street")}
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
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 mx-auto text-primary animate-pulse" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Map Loading</h3>
                <p className="text-muted-foreground">
                  TomTom API integration required
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your TomTom API key to enable live traffic visualization
                </p>
              </div>
            </div>
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
            <h3 className="font-semibold mb-4">Active Incidents</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-medium text-destructive">🚧 Road Closure</p>
                <p className="text-muted-foreground mt-1">Main St & 5th Ave</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <p className="font-medium text-warning">⚠️ Accident</p>
                <p className="text-muted-foreground mt-1">Highway 101 North</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
