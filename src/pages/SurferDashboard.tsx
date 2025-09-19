import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const SurferDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      <Header onSearchClick={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">My Dashboard</h1>
          <p className="text-muted-foreground">Discover photos, manage orders, and your saved items.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-accent" /> Discover Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Browse the latest surf shots and find your sessions.</p>
              <Button asChild>
                <Link to="/">Start Browsing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> My Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">View your purchase history and download digital files.</p>
              <Button variant="secondary" disabled>Coming soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary" /> Saved Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Quickly access photos you've liked or saved.</p>
              <Button variant="outline" disabled>Coming soon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SurferDashboard;
