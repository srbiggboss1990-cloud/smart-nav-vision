import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Target, Eye, FileText, Map as MapIcon, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
}

interface UserStats {
  pages_visited: string[];
  games_played: number;
  game_score: number;
  total_signs_analyzed: number;
}

const availableBadges = [
  {
    type: "safe_driver",
    name: "Safe Driver",
    icon: Shield,
    description: "Score 100+ points in Road Hero Challenge",
    color: "text-success",
  },
  {
    type: "road_hero",
    name: "Road Hero",
    icon: Trophy,
    description: "Score 200+ points in Road Hero Challenge",
    color: "text-warning",
  },
  {
    type: "quick_responder",
    name: "Quick Responder",
    icon: Target,
    description: "Answer all questions in under 20 seconds",
    color: "text-primary",
  },
  {
    type: "sign_expert",
    name: "Sign Expert",
    icon: FileText,
    description: "Analyze 10 road signs",
    color: "text-accent",
  },
  {
    type: "explorer",
    name: "Explorer",
    icon: MapIcon,
    description: "Visit all pages in the app",
    color: "text-primary",
  },
  {
    type: "watchful_eye",
    name: "Watchful Eye",
    icon: Eye,
    description: "Use Safety Monitor for 10+ sessions",
    color: "text-destructive",
  },
  {
    type: "endgame",
    name: "The Endgame",
    icon: Star,
    description: "Unlock all other badges",
    color: "text-warning",
  },
];

export default function Achievements() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to view achievements");
        setLoading(false);
        return;
      }

      // Fetch badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      // Fetch stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setBadges(badgesData || []);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setLoading(false);
    }
  };

  const hasBadge = (type: string) => badges.some(b => b.badge_type === type);
  const earnedCount = badges.length;
  const totalBadges = availableBadges.length;
  const progress = (earnedCount / totalBadges) * 100;

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-warning" />
          Achievements & Badges
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and earn badges for your accomplishments
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{earnedCount}/{totalBadges}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.games_played || 0}</p>
                <p className="text-sm text-muted-foreground">Games Played</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats?.game_score || 0}</p>
                <p className="text-sm text-muted-foreground">High Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_signs_analyzed || 0}</p>
                <p className="text-sm text-muted-foreground">Signs Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableBadges.map((badge) => {
          const Icon = badge.icon;
          const earned = hasBadge(badge.type);

          return (
            <Card
              key={badge.type}
              className={`shadow-card transition-all duration-300 ${
                earned 
                  ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-glow' 
                  : 'opacity-60 grayscale'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${earned ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon className={`h-6 w-6 ${earned ? badge.color : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{badge.name}</p>
                    {earned && (
                      <p className="text-xs text-muted-foreground">
                        <Award className="h-3 w-3 inline mr-1" />
                        Unlocked
                      </p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
