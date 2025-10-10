import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertTriangle, Activity } from "lucide-react";

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

export default function Dashboard() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time traffic insights and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
  );
}
