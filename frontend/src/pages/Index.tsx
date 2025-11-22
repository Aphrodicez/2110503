import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tent, MapPin, Calendar, Shield } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Tent className="h-20 w-20 mx-auto mb-6 text-primary" />
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Book your perfect campground and reconnect with nature. Easy
              booking, amazing locations.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/campgrounds">Browse Campgrounds</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      // ...existing code...
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Amazing Locations</h3>
              <p className="text-muted-foreground">
                Choose from diverse campgrounds across beautiful landscapes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Simple reservation system with flexible dates and instant
                confirmation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Your bookings and personal information are always protected
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
