import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tent, MapPin, Calendar, Shield } from "lucide-react";
import Header from "@/components/Header";
import CheckoutSection from "@/components/CheckoutSection";

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/v1/payments/create-checkout-session",
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error(`Checkout session failed with ${res.status}`);
      }

      const data = await res.json();
      if (!data?.url) {
        throw new Error("Missing redirect URL in checkout session response");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("Unable to start checkout. Please try again.");
      setIsSubmitting(false);
    }
  };

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

      {/* Stripe checkout section – can move to its own page later if you want */}
      {/* <section className="py-10">
        <div className="container mx-auto px-4">
          <CheckoutSection amount={78800} />
        </div>
      </section> */}

      <section className="py-10">
        <div className="container mx-auto px-4">
          <form onSubmit={handleCheckout} className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Redirecting…" : "Checkout"}
            </Button>
            {checkoutError ? (
              <p className="text-sm text-destructive">{checkoutError}</p>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  );
};

export default Index;
