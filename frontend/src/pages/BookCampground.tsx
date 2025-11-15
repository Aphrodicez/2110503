import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import { mockCampgrounds, mockBookings, mockReviews } from "@/data/mockData";
import { addDays, differenceInDays } from "date-fns";
import ReviewSection from "@/components/ReviewSection";

const BookCampground = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const campground = mockCampgrounds.find((c) => c.id === id);
  
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Simulate current user's active bookings
  const currentUserId = "user1";
  const userActiveBookings = mockBookings.filter(b => 
    b.userId === currentUserId && new Date(b.checkIn) >= new Date()
  );

  if (!campground) {
    return <div>Campground not found</div>;
  }

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (nights !== 1) {
      toast({
        title: "Error",
        description: "You can only book 1 day (1 night) per booking",
        variant: "destructive",
      });
      return;
    }

    if (userActiveBookings.length >= 3) {
      toast({
        title: "Error",
        description: "You have reached the maximum of 3 active bookings",
        variant: "destructive",
      });
      return;
    }

    // Simulate Stripe payment processing
    setIsProcessingPayment(true);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessingPayment(false);
    
    toast({
      title: "Success",
      description: "Payment successful! Booking created.",
    });
    navigate("/my-bookings");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="overflow-hidden">
            <img
              src={campground.image}
              alt={campground.name}
              className="w-full h-64 object-cover"
            />
            <CardHeader>
              <CardTitle className="text-3xl">{campground.name}</CardTitle>
              <CardDescription className="text-base">{campground.description}</CardDescription>
              <div className="space-y-2 pt-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{campground.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{campground.telephone}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    Booking Rules:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• You can only book 1 day (1 night) per booking</li>
                    <li>• Maximum 3 active bookings per user at a time</li>
                    <li>• You currently have {userActiveBookings.length} active booking(s)</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Check-in Date</Label>
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={(date) => {
                        setCheckIn(date);
                        if (date) {
                          setCheckOut(addDays(date, 1));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out Date (Auto-selected)</Label>
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => !checkIn || date !== addDays(checkIn, 1)}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                
                {nights > 0 && (
                  <div className="p-4 bg-accent rounded-md">
                    <p className="text-sm font-medium text-accent-foreground">
                      Total nights: {nights} {nights === 1 ? 'night' : 'nights'}
                    </p>
                    {nights !== 1 && (
                      <p className="text-sm text-destructive mt-1">
                        Only 1 night bookings are allowed
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!checkIn || !checkOut || nights !== 1 || userActiveBookings.length >= 3 || isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>Processing Payment...</>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Stripe & Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <ReviewSection 
                campgroundId={id!} 
                reviews={mockReviews}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookCampground;
