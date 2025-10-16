import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const { lat, lng, radius = 5000 } = await req.json();

    // Fetch nearby places (for traffic incidents simulation)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Fetch roads data
    const roadsUrl = `https://roads.googleapis.com/v1/nearestRoads?points=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const [placesResponse, roadsResponse] = await Promise.all([
      fetch(placesUrl),
      fetch(roadsUrl)
    ]);

    const placesData = await placesResponse.json();
    const roadsData = await roadsResponse.json();

    // Simulate traffic incidents based on location data
    const incidents = generateTrafficIncidents(placesData, lat, lng);
    
    // Fetch weather data for predictions
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=demo`; // You'll need OpenWeather API
    
    const response = {
      success: true,
      location: { lat, lng },
      incidents,
      roads: roadsData.snappedPoints || [],
      trafficLevel: calculateTrafficLevel(incidents),
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Traffic data error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateTrafficIncidents(placesData: any, lat: number, lng: number) {
  const incidents = [];
  const incidentTypes = ['accident', 'congestion', 'road_closure', 'construction'];
  
  // Generate 2-5 random incidents based on nearby places
  const count = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < count; i++) {
    const offsetLat = lat + (Math.random() - 0.5) * 0.02;
    const offsetLng = lng + (Math.random() - 0.5) * 0.02;
    
    incidents.push({
      id: `incident_${Date.now()}_${i}`,
      type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
      location: {
        lat: offsetLat,
        lng: offsetLng,
      },
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      description: generateIncidentDescription(incidentTypes[i % incidentTypes.length]),
      timestamp: new Date().toISOString(),
      distance: calculateDistance(lat, lng, offsetLat, offsetLng),
    });
  }
  
  return incidents.sort((a, b) => a.distance - b.distance);
}

function generateIncidentDescription(type: string): string {
  const descriptions: Record<string, string[]> = {
    accident: ['Multi-vehicle collision', 'Minor fender bender', 'Vehicle rollover'],
    congestion: ['Heavy traffic ahead', 'Slow moving traffic', 'Traffic jam'],
    road_closure: ['Road maintenance', 'Emergency closure', 'Construction work'],
    construction: ['Lane closure ahead', 'Road work in progress', 'Utility maintenance'],
  };
  
  const options = descriptions[type] || ['Traffic incident'];
  return options[Math.floor(Math.random() * options.length)];
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTrafficLevel(incidents: any[]): string {
  const highSeverity = incidents.filter(i => i.severity === 'high').length;
  const mediumSeverity = incidents.filter(i => i.severity === 'medium').length;
  
  if (highSeverity >= 2) return 'critical';
  if (highSeverity >= 1 || mediumSeverity >= 3) return 'heavy';
  if (mediumSeverity >= 1) return 'moderate';
  return 'light';
}
