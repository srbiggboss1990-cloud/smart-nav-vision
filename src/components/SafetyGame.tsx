import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, Target, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    question: "What should you do when you see a yellow traffic light?",
    options: ["Speed up", "Prepare to stop", "Stop immediately", "Honk"],
    correct: 1,
  },
  {
    question: "Safe following distance in normal conditions?",
    options: ["1 second", "2 seconds", "3 seconds", "5 seconds"],
    correct: 2,
  },
  {
    question: "When should you use high beams?",
    options: ["In fog", "Open rural roads", "In traffic", "Always"],
    correct: 1,
  },
  {
    question: "What does a red octagon sign mean?",
    options: ["Yield", "Stop", "Speed limit", "Warning"],
    correct: 1,
  },
  {
    question: "Ideal tire pressure check frequency?",
    options: ["Daily", "Weekly", "Monthly", "Yearly"],
    correct: 2,
  },
];

export function SafetyGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleAnswer(-1);
    }
  }, [isPlaying, timeLeft, answered]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = async (answerIndex: number) => {
    setAnswered(true);
    setSelectedAnswer(answerIndex);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      const points = Math.max(10, timeLeft * 2);
      setScore(score + points);
    }

    setTimeout(async () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        // Game over
        const finalScore = isCorrect ? score + Math.max(10, timeLeft * 2) : score;
        setIsPlaying(false);
        
        // Update user stats
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: stats } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (stats) {
              await supabase
                .from('user_stats')
                .update({
                  games_played: (stats.games_played || 0) + 1,
                  game_score: Math.max(stats.game_score || 0, finalScore),
                })
                .eq('user_id', user.id);
            } else {
              await supabase.from('user_stats').insert({
                user_id: user.id,
                games_played: 1,
                game_score: finalScore,
              });
            }

            // Award badges
            if (finalScore >= 200) {
              await supabase.from('user_badges').upsert({
                user_id: user.id,
                badge_type: 'road_hero',
                badge_name: 'Road Hero',
              }, { onConflict: 'user_id,badge_type' });
            }
            if (finalScore >= 100) {
              await supabase.from('user_badges').upsert({
                user_id: user.id,
                badge_type: 'safe_driver',
                badge_name: 'Safe Driver',
              }, { onConflict: 'user_id,badge_type' });
            }
          }
        } catch (error) {
          console.error('Error updating stats:', error);
        }

        toast.success(`Game Over! Final Score: ${finalScore}`, {
          description: finalScore >= 150 ? "Excellent work! 🏆" : "Good effort! Try again!",
        });
      }
    }, 1500);
  };

  if (!isPlaying) {
    return (
      <Card className="shadow-card hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary animate-pulse" />
            Road Hero Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test your road safety knowledge! Answer 5 questions in 30 seconds each to earn points and badges.
          </p>
          <div className="flex gap-2">
            <Target className="h-5 w-5 text-accent" />
            <p className="text-sm">
              <span className="font-semibold">Quick Responder:</span> Faster answers = More points!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" size="lg">
            <Trophy className="mr-2 h-5 w-5" />
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="shadow-glow animate-scale-in border-primary/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Question {currentQuestion + 1} / {questions.length}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
              <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : ''}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="font-bold text-lg">{score}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold">{question.question}</p>
        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct;
            const isSelected = index === selectedAnswer;
            let buttonClass = "w-full justify-start text-left h-auto py-3 px-4 transition-all duration-300";
            
            if (answered) {
              if (isCorrect) {
                buttonClass += " bg-success/20 border-success text-success hover:bg-success/30";
              } else if (isSelected && !isCorrect) {
                buttonClass += " bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30";
              }
            }

            return (
              <Button
                key={index}
                onClick={() => !answered && handleAnswer(index)}
                disabled={answered}
                variant={answered && isCorrect ? "default" : "outline"}
                className={buttonClass}
              >
                <span className="flex-1">{option}</span>
                {answered && isCorrect && <CheckCircle2 className="h-5 w-5 ml-2" />}
                {answered && isSelected && !isCorrect && <X className="h-5 w-5 ml-2" />}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
