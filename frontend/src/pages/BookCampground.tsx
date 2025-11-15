import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import { fetchCampground } from "@/services/campgrounds";
import { createBooking, fetchBookings } from "@/services/bookings";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const BookCampground = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookingDate, setBookingDate] = useState<Date>();
  const { user } = useAuth();

  const {
    data: campground,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["campground", id],
    queryFn: () => fetchCampground(id!),
    enabled: !!id,
  });

  const {
    data: myBookings,
    isLoading: isLoadingBookings,
  } = useQuery({
    queryKey: ["bookings", "self"],
    queryFn: fetchBookings,
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: (date: string) => createBooking(id!, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "self"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "admin"] });
      toast({ title: "Booking created", description: "Your campsite is reserved." });
      navigate("/my-bookings");
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : "Unable to create booking";
      toast({ title: "Booking failed", description: message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !id) {
      toast({ title: "Date required", description: "Please pick a booking date.", variant: "destructive" });
      return;
    }
    await bookingMutation.mutateAsync(bookingDate.toISOString());
  };

  const today = startOfToday();
  const userActiveBookings = myBookings?.filter(
    (booking) =>
      booking.user._id === user?._id && new Date(booking.bookingDate) >= today,
  );
  const bookingLimitReached = user?.role !== "admin" && (userActiveBookings?.length || 0) >= 3;

  const placeholderImage = campground
    ? `https://source.unsplash.com/featured/1000x600/?camping,${encodeURIComponent(campground.province)}`
    : undefined;

  const isPastDate = (date: Date) => date < today;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner label="Loading campground" />
        </div>
      </div>
    );
  }

  if (isError || !campground) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertTitle>Unable to load campground</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Campground not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="overflow-hidden">
            <img
              src={placeholderImage}
              alt={campground.name}
              className="h-64 w-full object-cover"
            />
            <CardHeader>
              <CardTitle className="text-3xl">{campground.name}</CardTitle>
              <CardDescription className="text-base">
                {campground.district}, {campground.province} ({campground.region})
              </CardDescription>
              <div className="space-y-2 pt-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {campground.address}, {campground.district}, {campground.province} {campground.postalcode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{campground.tel || "Contact info unavailable"}</span>
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
                    <li>• Bookings are for a single day</li>
                    <li>• Maximum 3 active bookings per user at a time</li>
                    <li>
                      • You currently have {userActiveBookings?.length || 0} active booking(s)
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label>Choose booking date</Label>
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => isPastDate(date)}
                    className="rounded-md border"
                  />
                  {bookingDate && (
                    <p className="text-sm text-muted-foreground">
                      Selected date: {format(bookingDate, "PPP")}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={
                    !bookingDate || bookingMutation.isPending || bookingLimitReached || isLoadingBookings
                  }
                >
                  {bookingMutation.isPending ? (
                    <Spinner label="Creating booking" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                {bookingLimitReached && (
                  <p className="text-sm text-destructive">
                    You already have 3 active bookings. Please cancel an existing booking before creating a new one.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookCampground;
