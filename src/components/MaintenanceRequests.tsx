import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wrench, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceRequest {
  id: string;
  user_name: string;
  issue_type: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
}

const issueTypes = [
  "Road Damage",
  "Pothole",
  "Damaged Signboard",
  "Faulty Traffic Signal",
  "Missing Road Marking",
  "Broken Streetlight",
  "Other"
];

export function MaintenanceRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    issue_type: "",
    description: "",
    location: ""
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchRequests();
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }

    // Subscribe to realtime updates
    const channel = supabase
      .channel('maintenance_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.issue_type || !formData.description || !formData.location) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to submit a request");
        return;
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          issue_type: formData.issue_type,
          description: formData.description,
          location: formData.location,
          latitude: userLocation?.lat || 0,
          longitude: userLocation?.lng || 0,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Maintenance request submitted successfully!");
      setIsOpen(false);
      setFormData({ issue_type: "", description: "", location: "" });
      fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error("Failed to submit request");
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Community Maintenance Requests
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary">
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Maintenance Issue</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_type">Issue Type</Label>
                  <Select
                    value={formData.issue_type}
                    onValueChange={(value) => setFormData({ ...formData, issue_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location or address"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary">
                  Submit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No maintenance requests yet. Be the first to report an issue!
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <h4 className="font-semibold">{request.issue_type}</h4>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      request.status === 'resolved'
                        ? 'bg-success/20 text-success'
                        : request.status === 'in_progress'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {request.status === 'resolved' && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                  <span>by {request.user_name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}