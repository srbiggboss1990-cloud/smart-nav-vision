import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Map, Shield, Zap, Brain, AlertTriangle, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AIAssistant from "@/components/AIAssistant";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Map,
      title: "Live Traffic Map",
      description: "Real-time traffic monitoring with AI-powered route optimization",
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/map",
    },
    {
      icon: Brain,
      title: "AI Sign Reader",
      description: "Instantly read and translate road signs using AI-powered OCR",
      color: "text-accent",
      bgColor: "bg-accent/10",
      route: "/sign-reader",
    },
    {
      icon: Shield,
      title: "Driver Safety Monitor",
      description: "Fatigue and distraction detection using advanced AI",
      color: "text-success",
      bgColor: "bg-success/10",
      route: "/safety",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Mode",
      description: "Priority routing for ambulances and emergency vehicles",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      route: "/emergency",
    },
    {
      icon: Cloud,
      title: "Weather Integration",
      description: "Weather-based traffic prediction and route recommendations",
      color: "text-warning",
      bgColor: "bg-warning/10",
      route: "/weather",
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description: "Instant notifications for accidents, congestion, and hazards",
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/dashboard",
    },
  ];

  return (
    <>
      <AIAssistant />
      <div className="container py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-sm font-medium text-primary animate-scale-in">
          <Zap className="h-4 w-4" />
          Powered by AI & Real-time Data
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Smart Traffic Intelligence
          </span>
          <br />
          <span className="text-foreground">for Safer Roads</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          TraffiScan combines AI-powered detection, real-time traffic monitoring, and predictive analytics to revolutionize urban mobility
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            size="lg"
            onClick={() => navigate("/map")}
            className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow group"
          >
            View Live Map
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="group hover:border-primary transition-all duration-300"
          >
            Analytics Dashboard
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Powerful Features</h2>
          <p className="text-muted-foreground">Everything you need for intelligent traffic management</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                onClick={() => navigate(feature.route)}
                className="shadow-card transition-all duration-300 hover:scale-105 hover:shadow-glow cursor-pointer group"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12 px-6 bg-gradient-primary rounded-2xl text-white shadow-glow">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Traffic Management?</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Join thousands of users already using TraffiScan to navigate smarter and safer
        </p>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate("/auth")}
          className="bg-white text-primary hover:bg-white/90 transition-all duration-300"
        >
          Get Started Free
        </Button>
      </section>
      </div>
    </>
  );
}
