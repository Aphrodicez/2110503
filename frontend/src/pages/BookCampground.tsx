import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import { fetchCampground } from "@/services/campgrounds";
import { createBooking, fetchBookings } from "@/services/bookings";
import { fetchCampgroundReviews } from "@/services/reviews";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/utils";
import RatingStars from "@/components/RatingStars";
import ReviewFormDialog from "@/components/reviews/ReviewFormDialog";

const BookCampground = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookingDate, setBookingDate] = useState<Date>();
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
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

  const { data: myBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", "self"],
    queryFn: fetchBookings,
    enabled: !!id,
  });

  const {
    data: reviewData,
    isLoading: isLoadingReviews,
    isError: isReviewError,
  } = useQuery({
    queryKey: ["campground-reviews", id],
    queryFn: () => fetchCampgroundReviews(id!),
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: (date: string) => createBooking(id!, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "self"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "admin"] });
      toast({
        title: "Booking created",
        description: "Your campsite is reserved. Payment pending.",
      });
      navigate("/my-bookings");
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create booking";
      toast({
        title: "Booking failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !id) {
      toast({
        title: "Date required",
        description: "Please pick a booking date.",
        variant: "destructive",
      });
      return;
    }
    await bookingMutation.mutateAsync(bookingDate.toISOString());
  };

  const today = startOfToday();
  const userActiveBookings = myBookings?.filter(
    (booking) =>
      booking.user._id === user?._id && new Date(booking.bookingDate) >= today
  );
  const bookingLimitReached =
    user?.role !== "admin" && (userActiveBookings?.length || 0) >= 3;

  const isPastDate = (date: Date) => date < today;

  const reviews = reviewData?.reviews ?? [];
  const latestReviews = reviews.slice(0, 3);
  const reviewSummary = reviewData?.summary;
  const averageRating = reviewSummary?.averageRating ?? 0;
  const reviewsCount = reviewSummary?.reviewsCount ?? 0;
  const myReview = reviews.find((review) => review.user._id === user?._id);

  const handleReviewSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["campground-reviews", id] });
    queryClient.invalidateQueries({ queryKey: ["campground", id] });
    setReviewDialogOpen(false);
  };

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

  const imageSrc =
    campground.image ||
    `https://source.unsplash.com/featured/1000x600/?camping,${encodeURIComponent(
      campground.province
    )}`;
  const priceLabel = formatPrice(campground.price);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="overflow-hidden">
            <img
              src={imageSrc}
              alt={campground.name}
              className="h-64 w-full object-cover"
            />
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-3xl">{campground.name}</CardTitle>
                  <CardDescription className="text-base">
                    {campground.district}, {campground.province} (
                    {campground.region})
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">
                    {priceLabel ?? "Price unavailable"}
                  </p>
                  {priceLabel && (
                    <p className="text-sm text-muted-foreground">per night</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {campground.address}, {campground.district},{" "}
                    {campground.province} {campground.postalcode}
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
                  <p className="text-sm font-medium">Booking Rules:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Bookings are for a single day</li>
                    <li>• Maximum 3 active bookings per user at a time</li>
                    <li>
                      • You currently have {userActiveBookings?.length || 0}{" "}
                      active booking(s)
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
                    !bookingDate ||
                    bookingMutation.isPending ||
                    bookingLimitReached ||
                    isLoadingBookings
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
                    You already have 3 active bookings. Please cancel an
                    existing booking before creating a new one.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campground reviews</CardTitle>
              <CardDescription>
                See what other campers think before you book
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner label="Loading reviews" />
                </div>
              ) : isReviewError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to load reviews</AlertTitle>
                  <AlertDescription>
                    Please try again in a moment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div>
                    {reviewsCount > 0 ? (
                      <div className="space-y-2">
                        <RatingStars
                          rating={averageRating}
                          showValue
                          size="lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          Based on {reviewsCount} review
                          {reviewsCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No reviews yet. Be the first to review this campground
                        and help fellow campers.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Latest reviews
                      </p>
                      {reviews.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          Showing latest 3
                        </span>
                      )}
                    </div>
                    {latestReviews.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {latestReviews.map((review) => (
                          <div
                            key={review._id}
                            className="rounded-lg border bg-card/70 p-4 aspect-square flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {review.user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <RatingStars
                                  rating={review.rating}
                                  size="sm"
                                  readOnly
                                />
                              </div>
                              <p
                                className="text-sm text-muted-foreground overflow-hidden"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {review.comment}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-xs font-medium text-primary underline-offset-2 hover:underline text-left"
                              onClick={() =>
                                navigate(
                                  `/campgrounds/${campground._id}/reviews`
                                )
                              }
                            >
                              Read more
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        There are no public reviews yet.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        My review
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewDialogOpen(true)}
                      >
                        {myReview ? "Edit" : "Write"}
                      </Button>
                    </div>
                    {myReview ? (
                      <div className="rounded-md border p-3">
                        <RatingStars
                          rating={myReview.rating}
                          size="sm"
                          readOnly
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated{" "}
                          {new Date(myReview.updatedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {myReview.comment}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        You have not reviewed this campground yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to={`/campgrounds/${campground._id}/reviews`}>
                  View all reviews
                </Link>
              </Button>
              <Button onClick={() => setReviewDialogOpen(true)}>
                {myReview ? "Edit your review" : "Write a review"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {id && (
        <ReviewFormDialog
          open={isReviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          campgroundId={id}
          review={myReview}
          onSuccess={handleReviewSaved}
        />
      )}
    </div>
  );
};

export default BookCampground;
