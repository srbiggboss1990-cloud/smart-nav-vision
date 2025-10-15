import { Home, Map, BarChart3, Cloud, Settings, AlertTriangle, Camera, FileText, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, href: "/", label: "Home" },
  { icon: Map, href: "/map", label: "Live Map" },
  { icon: BarChart3, href: "/dashboard", label: "Analytics" },
  { icon: Cloud, href: "/weather", label: "Weather" },
  { icon: AlertTriangle, href: "/emergency", label: "Emergency" },
  { icon: Camera, href: "/safety", label: "Safety Monitor" },
  { icon: FileText, href: "/sign-reader", label: "Sign Reader" },
  { icon: Trophy, href: "/achievements", label: "Achievements" },
  { icon: Settings, href: "/settings", label: "Settings" },
];

export const FloatingSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <nav className="flex flex-col gap-3 p-3 bg-card/80 backdrop-blur-xl rounded-2xl border border-border shadow-card animate-float">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group relative p-3 rounded-xl transition-all duration-300",
                "hover:scale-110 hover:bg-primary/10",
                isActive && "bg-gradient-primary text-primary-foreground shadow-glow"
              )}
              title={item.label}
            >
              <Icon className={cn(
                "h-6 w-6 transition-transform duration-300",
                "group-hover:rotate-12",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-3 py-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
