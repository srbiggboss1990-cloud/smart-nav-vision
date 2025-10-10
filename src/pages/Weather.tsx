import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Sun, Thermometer, Eye } from "lucide-react";

export default function Weather() {
  const weatherData = {
    temperature: 72,
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    airQuality: "Good",
    sunrise: "6:24 AM",
    sunset: "7:45 PM",
  };

  const forecast = [
    { day: "Mon", temp: 75, condition: "Sunny", icon: Sun },
    { day: "Tue", temp: 68, condition: "Cloudy", icon: Cloud },
    { day: "Wed", temp: 71, condition: "Partly Cloudy", icon: Cloud },
    { day: "Thu", temp: 73, condition: "Sunny", icon: Sun },
    { day: "Fri", temp: 69, condition: "Rainy", icon: Droplets },
  ];

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weather Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time weather conditions and traffic impact analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Temperature
            </CardTitle>
            <Thermometer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherData.temperature}°F</div>
            <p className="text-xs text-muted-foreground mt-1">Feels like 74°F</p>
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
            <div className="text-2xl font-bold">{weatherData.humidity}%</div>
            <p className="text-xs text-muted-foreground mt-1">Normal range</p>
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
            <div className="text-2xl font-bold">{weatherData.windSpeed} mph</div>
            <p className="text-xs text-muted-foreground mt-1">Light breeze</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visibility
            </CardTitle>
            <Eye className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherData.visibility} mi</div>
            <p className="text-xs text-muted-foreground mt-1">Excellent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecast.map((day) => {
                const Icon = day.icon;
                return (
                  <div
                    key={day.day}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{day.day}</p>
                        <p className="text-sm text-muted-foreground">{day.condition}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{day.temp}°</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weather Impact on Traffic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-success mt-2 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-success">Good Conditions</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current weather is optimal for driving. No significant traffic delays expected.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Air Quality Index</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current AQI</span>
                <span className="font-bold text-success">{weatherData.airQuality}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-success w-3/4 transition-all duration-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sunrise</p>
                <p className="font-semibold">{weatherData.sunrise}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sunset</p>
                <p className="font-semibold">{weatherData.sunset}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
