-- Create SOS alerts table
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active alerts (so they can respond)
CREATE POLICY "Anyone can view active SOS alerts" 
ON public.sos_alerts 
FOR SELECT 
USING (status = 'active');

-- Users can create their own alerts
CREATE POLICY "Users can create their own SOS alerts" 
ON public.sos_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts
CREATE POLICY "Users can update their own SOS alerts" 
ON public.sos_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create responses table
CREATE TABLE IF NOT EXISTS public.sos_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.sos_alerts(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  responder_name TEXT NOT NULL,
  response_type TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sos_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can view responses
CREATE POLICY "Anyone can view SOS responses" 
ON public.sos_responses 
FOR SELECT 
USING (true);

-- Users can create responses
CREATE POLICY "Users can create SOS responses" 
ON public.sos_responses 
FOR INSERT 
WITH CHECK (auth.uid() = responder_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_responses;