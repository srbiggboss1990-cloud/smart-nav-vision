import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SignReader() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCameraActive(true);
      toast({
        title: "Camera Started",
        description: "Point at a road sign to capture",
      });
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setImage(imageData);
        stopCamera();
        toast({
          title: "Image Captured",
          description: "Analyzing road sign...",
        });
        analyzeImage(imageData);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImage(imageData);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-sign", {
        body: { image: imageData },
      });

      if (error) throw error;

      setResult(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Road sign information extracted",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Sign Reader</h1>
        <p className="text-muted-foreground mt-2">
          Capture or upload road signs for instant AI-powered analysis and translation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Capture Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <Button
                    onClick={captureImage}
                    size="lg"
                    className="absolute bottom-4 left-1/2 -translate-x-1/2"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Capture
                  </Button>
                </>
              ) : image ? (
                <img src={image} alt="Captured sign" className="w-full h-full object-contain" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No image captured yet</p>
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3">
              {!cameraActive ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Stop Camera
                </Button>
              )}
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing road sign...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Sign Information:</h3>
                  <p className="text-sm whitespace-pre-wrap">{result}</p>
                </div>
                <Button
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Analyze Another Sign
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Capture or upload an image of a road sign to see AI-powered analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Speed Limit Detection</h4>
              <p className="text-sm text-muted-foreground">
                Instantly reads and translates speed limit signs in any format
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Warning Signs</h4>
              <p className="text-sm text-muted-foreground">
                Identifies hazard warnings and provides safety information
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Multi-Language Support</h4>
              <p className="text-sm text-muted-foreground">
                Translates foreign road signs for international travelers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
