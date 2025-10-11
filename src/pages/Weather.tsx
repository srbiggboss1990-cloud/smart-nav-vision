import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Sun, Thermometer, Eye, AlertCircle, CloudRain } from "lucide-react";
import AIAssistant from "@/components/AIAssistant";
import { toast } from "sonner";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  visibility: number;
  pressure: number;
  trafficImpact: string;
  alerts: string[];
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    feelsLike: 68,
    humidity: 65,
    windSpeed: 12,
    conditions: "Partly Cloudy",
    visibility: 10,
    pressure: 1013,
    trafficImpact: "low",
    alerts: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,visibility&temperature_unit=fahrenheit&wind_speed_unit=mph`
            );
            
            const data = await response.json();
            
            if (data.current) {
              const weatherCode = data.current.weather_code;
              const conditions = getWeatherCondition(weatherCode);
              const impact = getTrafficImpact(weatherCode, data.current.wind_speed_10m);
              
              setWeather({
                temperature: Math.round(data.current.temperature_2m),
                feelsLike: Math.round(data.current.temperature_2m - 2),
                humidity: data.current.relative_humidity_2m,
                windSpeed: Math.round(data.current.wind_speed_10m),
                conditions,
                visibility: data.current.visibility ? Math.round(data.current.visibility / 1609) : 10,
                pressure: Math.round(data.current.surface_pressure),
                trafficImpact: impact.level,
                alerts: impact.alerts,
              });

              if (impact.alerts.length > 0) {
                toast.warning("Weather Alert", {
                  description: impact.alerts[0],
                });
              }
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error("Unable to get your location for weather data");
          }
        );
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
      toast.error("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain Showers";
    if (code <= 86) return "Snow Showers";
    return "Stormy";
  };

  const getTrafficImpact = (weatherCode: number, windSpeed: number) => {
    const alerts: string[] = [];
    let level = "low";

    if (weatherCode >= 51 && weatherCode <= 67) {
      level = "medium";
      alerts.push("Rainy conditions - reduced visibility and slippery roads");
    }
    if (weatherCode >= 71 && weatherCode <= 77) {
      level = "high";
      alerts.push("Snow conditions - drive carefully and reduce speed");
    }
    if (weatherCode >= 95) {
      level = "high";
      alerts.push("Severe weather - consider delaying travel");
    }
    if (windSpeed > 25) {
      level = level === "low" ? "medium" : "high";
      alerts.push("High winds - be cautious of crosswinds");
    }

    return { level, alerts };
  };

  return (
    <>
      <AIAssistant />
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Weather Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time weather conditions and traffic impact predictions
          </p>
        </div>

        {weather.alerts.length > 0 && (
          <Card className="shadow-glow border-warning bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {weather.alerts.map((alert, index) => (
                    <p key={index} className="text-sm font-medium">{alert}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Temperature
              </CardTitle>
              <Thermometer className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weather.temperature}°F</div>
              <p className="text-xs text-muted-foreground mt-1">Feels like {weather.feelsLike}°F</p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Humidity
              </CardTitle>
              <Droplets className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weather.humidity}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {weather.humidity > 70 ? "High" : weather.humidity > 40 ? "Comfortable" : "Low"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wind Speed
              </CardTitle>
              <Wind className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weather.windSpeed} mph</div>
              <p className="text-xs text-muted-foreground mt-1">
                {weather.windSpeed > 25 ? "Strong" : weather.windSpeed > 15 ? "Moderate" : "Light breeze"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visibility
              </CardTitle>
              {weather.conditions.includes("Rain") ? <CloudRain className="h-4 w-4" /> : 
               weather.conditions.includes("Clear") ? <Sun className="h-4 w-4" /> : 
               <Cloud className="h-4 w-4" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weather.conditions}</div>
              <p className="text-xs text-muted-foreground mt-1">Updated now</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Visibility</span>
                <span className="font-bold">{weather.visibility} miles</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Pressure</span>
                <span className="font-bold">{weather.pressure} mb</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Traffic Impact</span>
                <span className={`font-bold ${
                  weather.trafficImpact === "high" ? "text-destructive" :
                  weather.trafficImpact === "medium" ? "text-warning" : "text-success"
                }`}>
                  {weather.trafficImpact.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Weather Impact on Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weather.trafficImpact === "low" && (
                  <p className="text-muted-foreground">
                    Current weather conditions are favorable for driving. No significant impact on traffic expected.
                  </p>
                )}
                {weather.trafficImpact === "medium" && (
                  <>
                    <p className="text-warning font-medium">Moderate weather impact expected:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                      <li>• Reduce speed in affected areas</li>
                      <li>• Increase following distance</li>
                      <li>• Use headlights for visibility</li>
                      <li>• Allow extra travel time</li>
                    </ul>
                  </>
                )}
                {weather.trafficImpact === "high" && (
                  <>
                    <p className="text-destructive font-medium">High weather impact - Drive with caution:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                      <li>• Significantly reduce speed</li>
                      <li>• Avoid unnecessary travel if possible</li>
                      <li>• Keep emergency kit in vehicle</li>
                      <li>• Monitor weather updates frequently</li>
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
