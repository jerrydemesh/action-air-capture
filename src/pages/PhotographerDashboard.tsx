import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon, Upload, Camera, MapPin, DollarSign, Image, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";

interface Photo {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  location: string;
  date_taken: string;
  digital_price: number;
  is_featured: boolean;
  is_active: boolean;
}

interface PhotoUpload {
  title: string;
  description: string;
  location: string;
  dateTaken: Date | null;
  digitalPrice: number;
  imageFile: File | null;
}

const PhotographerDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState<PhotoUpload>({
    title: "",
    description: "",
    location: "",
    dateTaken: null,
    digitalPrice: 25,
    imageFile: null,
  });

  useEffect(() => {
    if (profile?.role === 'photographer') {
      fetchPhotos();
    }
  }, [profile]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('photographer_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, imageFile: file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.imageFile || !uploadData.location || !uploadData.dateTaken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select an image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload image to storage (placeholder - would need actual storage setup)
      const imageUrl = URL.createObjectURL(uploadData.imageFile);
      
      const { error } = await supabase
        .from('photos')
        .insert({
          photographer_id: profile?.user_id,
          image_url: imageUrl,
          title: uploadData.title || 'Surf Session',
          description: uploadData.description,
          location: uploadData.location,
          date_taken: uploadData.dateTaken.toISOString(),
          digital_price: uploadData.digitalPrice * 100, // Convert to cents
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo uploaded successfully!",
      });

      setUploadOpen(false);
      setUploadData({
        title: "",
        description: "",
        location: "",
        dateTaken: null,
        digitalPrice: 25,
        imageFile: null,
      });
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (profile?.role !== 'photographer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <Header onSearchClick={() => {}} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This page is only accessible to photographers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      <Header onSearchClick={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Photographer Dashboard</h1>
            <p className="text-muted-foreground">Manage your surf photography portfolio</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Image File *</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Dawn Patrol at Malibu"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    placeholder="e.g., Malibu, CA"
                    value={uploadData.location}
                    onChange={(e) => setUploadData({ ...uploadData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Taken *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {uploadData.dateTaken ? format(uploadData.dateTaken, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={uploadData.dateTaken || undefined}
                        onSelect={(date) => setUploadData({ ...uploadData, dateTaken: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Digital Price ($)</Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={uploadData.digitalPrice}
                    onChange={(e) => setUploadData({ ...uploadData, digitalPrice: parseFloat(e.target.value) || 25 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the surf session, conditions, etc."
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photos">My Photos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                  </Card>
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No photos uploaded yet</h3>
                <p className="text-muted-foreground">Start building your portfolio by uploading your first surf photo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={photo.thumbnail_url || photo.image_url}
                        alt={photo.title || "Photo"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-white text-center">
                          <Settings className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Manage</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        {photo.is_featured && (
                          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                        {!photo.is_active && (
                          <Badge variant="destructive">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-background/90 text-foreground">
                          {formatPrice(photo.digital_price)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {photo.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{photo.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(photo.date_taken), 'MMM d, yyyy')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Photo Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{photos.length}</div>
                    <p className="text-muted-foreground">Total Photos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">0</div>
                    <p className="text-muted-foreground">Total Sales</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">$0</div>
                    <p className="text-muted-foreground">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea placeholder="Tell surfers about your photography style and experience..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input placeholder="Your base location" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="Contact number" />
                  </div>
                  <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhotographerDashboard;