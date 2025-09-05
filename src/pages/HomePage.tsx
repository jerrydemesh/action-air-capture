import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Camera, Clock, DollarSign, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";

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

interface SearchFilters {
  location: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

const HomePage = () => {
  const { profile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    dateFrom: null,
    dateTo: null,
  });

  useEffect(() => {
    fetchFeaturedPhotos();
  }, []);

  const fetchFeaturedPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('photos')
        .select('*')
        .eq('is_active', true);

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('date_taken', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('date_taken', filters.dateTo.toISOString());
      }

      const { data, error } = await query
        .order('date_taken', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPhotos(data || []);
      setSearchOpen(false);
    } catch (error) {
      console.error('Error searching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      dateFrom: null,
      dateTo: null,
    });
    fetchFeaturedPhotos();
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <Header onSearchClick={() => setSearchOpen(true)} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      <Header onSearchClick={() => setSearchOpen(true)} />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Capture Your Perfect Wave
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Discover stunning drone photography of your surfing sessions from professional photographers
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-primary font-semibold"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-5 w-5" />
            Find Your Photos
          </Button>
        </div>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Photo Gallery */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">
            {filters.location || filters.dateFrom || filters.dateTo ? 'Search Results' : 'Featured Photos'}
          </h2>
          {(filters.location || filters.dateFrom || filters.dateTo) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {photos.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No photos found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title || "Surf photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-3 left-3">
                    {photo.is_featured && (
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-background/90 text-foreground">
                      {formatPrice(photo.digital_price)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {photo.title || "Surf Session"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{photo.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(photo.date_taken), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Photos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="e.g., Huntington Beach, Malibu"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "MMM d") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom || undefined}
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "MMM d") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo || undefined}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;