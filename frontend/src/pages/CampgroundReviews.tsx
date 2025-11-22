import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RatingStars from "@/components/RatingStars";
import ReviewFormDialog from "@/components/reviews/ReviewFormDialog";
import { fetchCampground } from "@/services/campgrounds";
import { deleteReview, fetchCampgroundReviews } from "@/services/reviews";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Review } from "@/types";
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

const CampgroundReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const campgroundQuery = useQuery({
    queryKey: ["campground", id],
    queryFn: () => fetchCampground(id!),
    enabled: Boolean(id),
  });

  const reviewsQuery = useQuery({
    queryKey: ["campground-reviews", id],
    queryFn: () => fetchCampgroundReviews(id!),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "Your feedback has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["campground-reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["campground", id] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to delete review";
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const campground = campgroundQuery.data;
  const reviews = reviewsQuery.data?.reviews ?? [];
  const summary = reviewsQuery.data?.summary;
  const userId = user?._id;

  const myReview = useMemo(
    () => reviews.find((review) => review.user._id === userId),
    [reviews, userId]
  );

  const handleOpenDialog = (review: Review | null) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  const handleReviewSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["campground-reviews", id] });
    queryClient.invalidateQueries({ queryKey: ["campground", id] });
  };

  const isLoading = campgroundQuery.isLoading || reviewsQuery.isLoading;
  const isError = campgroundQuery.isError || reviewsQuery.isError;

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertTitle>Missing campground</AlertTitle>
            <AlertDescription>No campground id was provided.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner label="Loading reviews" />
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
            <AlertTitle>Unable to load reviews</AlertTitle>
            <AlertDescription>
              The campground could not be found.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const priceLabel = formatPrice(campground.price);
  const reviewsCount = summary?.reviewsCount ?? 0;
  const averageRating = summary?.averageRating ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 space-y-6">
        <Card className="overflow-hidden">
          <img
            src={
              campground.image ||
              `https://source.unsplash.com/featured/1000x600/?camping,${encodeURIComponent(
                campground.province
              )}`
            }
            alt={campground.name}
            className="h-64 w-full object-cover"
          />
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-3xl">{campground.name}</CardTitle>
                <CardDescription>
                  {campground.district}, {campground.province} (
                  {campground.region})
                </CardDescription>
              </div>
              <div className="text-right">
                {priceLabel && (
                  <p className="text-lg font-semibold text-foreground">
                    {priceLabel} / night
                  </p>
                )}
                <RatingStars rating={averageRating} showValue size="lg" />
                <p className="text-sm text-muted-foreground">
                  {reviewsCount} review{reviewsCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button onClick={() => navigate(`/book/${campground._id}`)}>
              Book this campground
            </Button>
            <Button
              variant="secondary"
              disabled={!user}
              onClick={() => handleOpenDialog(myReview ?? null)}
            >
              {user
                ? myReview
                  ? "Edit your review"
                  : "Write a review"
                : "Login to review"}
            </Button>
          </CardFooter>
        </Card>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
              {user && (
                <Button className="mt-4" onClick={() => handleOpenDialog(null)}>
                  Write the first review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => {
              const isOwner = review.user._id === user?._id;
              const createdAt = new Date(review.createdAt).toLocaleDateString();
              return (
                <Card key={review._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {review.user.name}
                        </CardTitle>
                        <CardDescription>
                          <RatingStars rating={review.rating} size="sm" />
                          <span className="text-xs text-muted-foreground block mt-1">
                            {createdAt}
                          </span>
                        </CardDescription>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(review)}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteMutation.isPending}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete review
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this review?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate(review._id)
                                  }
                                  disabled={deleteMutation.isPending}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ReviewFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        campgroundId={campground._id}
        review={selectedReview}
        onSuccess={handleReviewSaved}
      />
    </div>
  );
};

export default CampgroundReviews;
