import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import AIAssistant from "@/components/AIAssistant";
import { SafetyGame } from "@/components/SafetyGame";
import { PredictiveAlerts } from "@/components/PredictiveAlerts";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";

const stats = [
  {
    title: "Active Incidents",
    value: "23",
    change: "+5.2%",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    title: "Traffic Flow",
    value: "87%",
    change: "+12.3%",
    icon: Activity,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Average Speed",
    value: "45 mph",
    change: "-8.1%",
    icon: TrendingUp,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Reports Today",
    value: "156",
    change: "+23.5%",
    icon: BarChart3,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

// Weekly accident trends data
const weeklyAccidentData = [
  { day: "Mon", accidents: 12, congestion: 45, airQuality: 78 },
  { day: "Tue", accidents: 19, congestion: 62, airQuality: 72 },
  { day: "Wed", accidents: 15, congestion: 55, airQuality: 75 },
  { day: "Thu", accidents: 22, congestion: 70, airQuality: 68 },
  { day: "Fri", accidents: 28, congestion: 85, airQuality: 65 },
  { day: "Sat", accidents: 18, congestion: 48, airQuality: 80 },
  { day: "Sun", accidents: 14, congestion: 38, airQuality: 85 },
];

// Hourly congestion data
const hourlyCongestionData = [
  { time: "6AM", level: 20 },
  { time: "9AM", level: 85 },
  { time: "12PM", level: 60 },
  { time: "3PM", level: 70 },
  { time: "6PM", level: 90 },
  { time: "9PM", level: 40 },
  { time: "12AM", level: 15 },
];

// Environmental data
const environmentalData = [
  { time: "6AM", temperature: 65, humidity: 70, airQuality: 85 },
  { time: "9AM", temperature: 72, humidity: 65, airQuality: 78 },
  { time: "12PM", temperature: 80, humidity: 55, airQuality: 70 },
  { time: "3PM", temperature: 85, humidity: 50, airQuality: 68 },
  { time: "6PM", temperature: 78, humidity: 60, airQuality: 72 },
  { time: "9PM", temperature: 70, humidity: 68, airQuality: 80 },
];

export default function Dashboard() {
  const [liveStats, setLiveStats] = useState(stats);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Update stats every 3 seconds to simulate live data
    const interval = setInterval(() => {
      setLiveStats(prevStats => prevStats.map(stat => {
        const currentValue = parseInt(stat.value) || 0;
        const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newValue = Math.max(0, currentValue + variation);
        
        return {
          ...stat,
          value: stat.title.includes("mph") || stat.title.includes("Speed") 
            ? `${newValue} mph` 
            : stat.title.includes("%") || stat.title.includes("Flow")
            ? `${Math.min(100, newValue)}%`
            : newValue.toString()
        };
      }));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AIAssistant />
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Real-time traffic insights and statistics
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Live • Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {liveStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow cursor-pointer group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'} flex items-center gap-1 mt-1`}>
                    {stat.change} from last week
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Predictive Alerts System */}
        <PredictiveAlerts />

        {/* Safety Game */}
        <SafetyGame />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Accident Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyAccidentData}>
                  <defs>
                    <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Area type="monotone" dataKey="accidents" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorAccidents)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-warning" />
                Hourly Congestion Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyCongestionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="level" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card hover:shadow-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              Environmental Data (Temperature, Humidity, Air Quality)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="humidity" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="airQuality" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Traffic Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Accidents", "Congestion", "Road Hazards", "Violations", "Breakdowns"].map((type, index) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{type}</span>
                      <span className="font-medium">{85 - index * 15}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${85 - index * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Accident", location: "Main St & 5th Ave", time: "5 min ago", severity: "high" },
                  { type: "Congestion", location: "Highway 101", time: "12 min ago", severity: "medium" },
                  { type: "Violation", location: "Oak Street", time: "23 min ago", severity: "low" },
                  { type: "Breakdown", location: "Park Avenue", time: "35 min ago", severity: "medium" },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-300"
                  >
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      activity.severity === "high" ? "bg-destructive" :
                      activity.severity === "medium" ? "bg-warning" : "bg-success"
                    } animate-pulse`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
