import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Calendar, Camera, Download, ShoppingCart, ArrowLeft, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import WatermarkedImage from "@/components/ui/WatermarkedImage";
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
  photographer_id: string;
  is_featured: boolean;
  metadata: any;
}

interface PrintOption {
  id: string;
  name: string;
  type: string;
  width_inches: number;
  height_inches: number;
  price: number;
  description?: string;
}

interface Photographer {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_image_url?: string;
}

const PhotoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [printOptions, setPrintOptions] = useState<PrintOption[]>([]);
  const [selectedPrint, setSelectedPrint] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPhotoDetails();
      fetchPrintOptions();
    }
  }, [id]);

  const fetchPhotoDetails = async () => {
    try {
      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (photoError) throw photoError;
      setPhoto(photoData);

      // Fetch photographer details
      const { data: photographerData, error: photographerError } = await supabase
        .from('marketplace_profiles')
        .select('id, first_name, last_name, bio, profile_image_url')
        .eq('user_id', photoData.photographer_id)
        .single();

      if (photographerError) throw photographerError;
      setPhotographer(photographerData);
    } catch (error) {
      console.error('Error fetching photo details:', error);
      toast({
        title: "Error",
        description: "Photo not found",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrintOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('print_options')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      setPrintOptions(data || []);
    } catch (error) {
      console.error('Error fetching print options:', error);
    }
  };

  const handlePurchase = async (type: 'digital' | 'print') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase photos",
        variant: "destructive",
      });
      return;
    }

    if (type === 'print' && !selectedPrint) {
      toast({
        title: "Print Option Required",
        description: "Please select a print option",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    try {
      // Create order logic would go here
      // For now, just show success message
      toast({
        title: "Purchase Initiated",
        description: `Your ${type} purchase is being processed`,
      });
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <Header onSearchClick={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded" />
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <Header onSearchClick={() => {}} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Photo Not Found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  const selectedPrintOption = printOptions.find(p => p.id === selectedPrint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      <Header onSearchClick={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photo Display */}
          <div className="space-y-4">
            <WatermarkedImage
              src={photo.image_url}
              alt={photo.title || "Surf photo"}
              className="w-full aspect-square rounded-lg shadow-lg"
            />
            
            {photo.is_featured && (
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                Featured Photo
              </Badge>
            )}
          </div>

          {/* Photo Details & Purchase */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {photo.title || "Surf Session"}
              </h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{photo.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(photo.date_taken), 'PPP')}</span>
                </div>
              </div>

              {photo.description && (
                <p className="text-foreground mb-6">{photo.description}</p>
              )}
            </div>

            {/* Photographer Info */}
            {photographer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Photographer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    {photographer.profile_image_url ? (
                      <img 
                        src={photographer.profile_image_url} 
                        alt={`${photographer.first_name} ${photographer.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {photographer.first_name} {photographer.last_name}
                      </h3>
                      {photographer.bio && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {photographer.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Options */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Digital Download */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Digital Download</h3>
                    <p className="text-sm text-muted-foreground">
                      High-resolution digital file
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(photo.digital_price)}
                    </div>
                    <Button 
                      onClick={() => handlePurchase('digital')}
                      disabled={purchasing}
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Buy Digital
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Print Options */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Print Options</h3>
                  
                  <Select value={selectedPrint} onValueChange={setSelectedPrint}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select print size" />
                    </SelectTrigger>
                    <SelectContent>
                      {printOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} - {formatPrice(option.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPrintOption && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{selectedPrintOption.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedPrintOption.width_inches}" × {selectedPrintOption.height_inches}"
                          </p>
                          {selectedPrintOption.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedPrintOption.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(selectedPrintOption.price)}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handlePurchase('print')}
                        disabled={purchasing}
                        className="w-full"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Order Print
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailPage;