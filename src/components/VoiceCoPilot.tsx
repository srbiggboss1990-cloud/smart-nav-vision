import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { toast } from "sonner";

export function VoiceCoPilot() {
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        // Check for wake word
        if (transcriptText.toLowerCase().includes('hey traffi')) {
          handleVoiceCommand(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('map') || lowerCommand.includes('navigate')) {
      speak("Opening live traffic map for you");
      setTimeout(() => window.location.href = '/map', 1000);
    } else if (lowerCommand.includes('emergency') || lowerCommand.includes('sos')) {
      speak("Opening emergency page. Stay safe!");
      setTimeout(() => window.location.href = '/emergency', 1000);
    } else if (lowerCommand.includes('weather')) {
      speak("Checking weather conditions");
      setTimeout(() => window.location.href = '/weather', 1000);
    } else if (lowerCommand.includes('take a break') || lowerCommand.includes('tired')) {
      speak("You seem tired. Please take a short break for safety.");
      toast.info("Remember to take breaks!", { description: "Your safety is important" });
    } else {
      speak("How can I help you drive safer today?");
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast.success("Voice co-pilot stopped");
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setIsMinimized(false);
        toast.success("Voice co-pilot activated! Say 'Hey Traffi' to start");
      } else {
        toast.error("Voice recognition not supported in this browser");
      }
    }
  };

  if (isMinimized && !isListening) {
    return (
      <Button
        onClick={toggleListening}
        size="icon"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-glow bg-gradient-primary hover:opacity-90 z-50 animate-pulse"
      >
        <Mic className="h-8 w-8 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 p-4 shadow-glow z-50 w-80 animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Voice Co-Pilot</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleListening}
            size="icon"
            variant={isListening ? "destructive" : "default"}
            className="h-8 w-8"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => {
              setIsMinimized(true);
              if (recognitionRef.current) recognitionRef.current.stop();
              setIsListening(false);
            }}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {isListening ? "Listening... Say 'Hey Traffi'" : "Click mic to activate"}
        </p>
        
        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Try saying:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>"Hey Traffi, open map"</li>
            <li>"Hey Traffi, emergency"</li>
            <li>"Hey Traffi, check weather"</li>
            <li>"I'm feeling tired"</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}