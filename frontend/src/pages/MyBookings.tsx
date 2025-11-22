import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Trash2, CreditCard, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import { fetchBookings, deleteBooking } from "@/services/bookings";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import type { Booking as BookingType, Campground } from "@/types";
import {
  createCheckoutSession,
  finalizeCheckoutBooking,
} from "@/services/payments";
import { Badge } from "@/components/ui/badge";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { useAuth } from "@/hooks/useAuth";

const MyBookings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const formatLocation = (campground: Campground) => {
    const segments = [
      campground.address,
      campground.district,
      campground.province,
      campground.postalcode,
    ].filter(Boolean);

    return segments.join(", ");
  };

  const {
    data: bookings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings", "self"],
    queryFn: fetchBookings,
  });

  const finalizeCheckoutMutation = useMutation({
    mutationFn: finalizeCheckoutBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "self"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "admin"] });
      setShowSuccessAlert(true);
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "We couldn't confirm your payment";
      toast({
        title: "Booking confirmation failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam !== "success") {
      return;
    }

    const sessionId = searchParams.get("session_id");

    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("session_id");
    setSearchParams(params, { replace: true });

    if (!sessionId) {
      toast({
        title: "Missing checkout reference",
        description: "We can't finalize this booking without a session id.",
        variant: "destructive",
      });
      return;
    }

    setPendingSessionId(sessionId);
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    if (!pendingSessionId || finalizeCheckoutMutation.isPending) {
      return;
    }

    finalizeCheckoutMutation.mutate(pendingSessionId, {
      onSettled: () => setPendingSessionId(null),
    });
  }, [finalizeCheckoutMutation, pendingSessionId]);

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "self"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "admin"] });
      toast({
        title: "Booking deleted",
        description: "Your booking has been removed.",
      });
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to delete booking";
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (!data?.url) {
        throw new Error("Missing redirect URL for checkout session");
      }
      window.location.href = data.url;
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to start payment";
      toast({
        title: "Payment failed",
        description: message,
        variant: "destructive",
      });
    },
    onSettled: () => setPayingBookingId(null),
  });

  const handlePay = (booking: BookingType) => {
    if (!booking.campground?._id) {
      toast({
        title: "Missing campground",
        description: "We can't start payment for this booking right now.",
        variant: "destructive",
      });
      return;
    }
    setPayingBookingId(booking._id);
    checkoutMutation.mutate({
      bookingDate: booking.bookingDate,
      campgroundId: booking.campground._id,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isAdmin ? "Bookings" : "My Bookings"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage all campground reservations"
              : "View and manage your campground reservations"}
          </p>
        </div>

        {finalizeCheckoutMutation.isPending && (
          <Alert className="mb-6 border border-primary/30 bg-primary/5">
            <AlertTitle>Finalizing your booking</AlertTitle>
            <AlertDescription>
              Hang tight while we confirm your payment with Stripe.
            </AlertDescription>
          </Alert>
        )}

        {showSuccessAlert && (
          <Alert className="mb-6 flex flex-col gap-4 border-emerald-400/80 bg-emerald-50 text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <AlertTitle>Booking confirmed</AlertTitle>
              <AlertDescription>
                Your reservation is confirmed.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="self-start border border-transparent px-3 text-emerald-900 hover:text-emerald-900"
              onClick={() => setShowSuccessAlert(false)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {isLoading && (
          <div className="flex h-48 items-center justify-center">
            <Spinner label="Loading bookings" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Unable to load bookings</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Unknown error"}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && bookings && bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don't have any bookings yet
              </p>
              <Button asChild>
                <Link to="/campgrounds">Browse Campgrounds</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings?.map((booking) => (
              <Card key={booking._id} className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.campground.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.bookingDate), "PPP")}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4" />
                        {booking.user?.name || "Unknown User"}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {formatLocation(booking.campground) ||
                          "Location unavailable"}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <CreditCard className="h-4 w-4" />
                        {formatPrice(booking.campground.price) ??
                          "Price unavailable"}
                      </CardDescription>
                      <CardDescription className="mt-2">
                        <Badge
                          variant={
                            booking.paymentStatus === "paid"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {booking.paymentStatus === "paid"
                            ? "Paid"
                            : "Payment pending"}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {!isAdmin && booking.paymentStatus !== "paid" && (
                        <Button
                          variant="default"
                          disabled={checkoutMutation.isPending}
                          onClick={() => handlePay(booking)}
                        >
                          {checkoutMutation.isPending &&
                          payingBookingId === booking._id
                            ? "Redirecting..."
                            : "Pay Now"}
                        </Button>
                      )}
                      <EditBookingDialog booking={booking} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this booking? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(booking._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
