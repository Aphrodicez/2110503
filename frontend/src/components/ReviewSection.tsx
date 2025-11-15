import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Review } from "@/types";
import { fetchReviews, createReview, updateReview, deleteReview } from "@/services/reviews";
import { useAuth } from "@/hooks/useAuth";

interface ReviewSectionProps {
  campgroundId: string;
}

const ReviewSection = ({ campgroundId }: ReviewSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading, isError, error } = useQuery({
    queryKey: ["reviews", campgroundId],
    queryFn: () => fetchReviews(campgroundId),
  });

  const handleResetForm = () => {
    setEditingReview(null);
    setRating(5);
    setComment("");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    handleResetForm();
  };

  const createMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      createReview(campgroundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", campgroundId] });
      toast({ title: "Review added", description: "Thanks for sharing your experience." });
      closeDialog();
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : "Unable to add review";
      toast({ title: "Review failed", description: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: { rating: number; comment: string } }) =>
      updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", campgroundId] });
      toast({ title: "Review updated", description: "Your review was updated successfully." });
      closeDialog();
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : "Unable to update review";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", campgroundId] });
      toast({ title: "Review deleted", description: "Your review has been removed." });
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : "Unable to delete review";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Login required", description: "Please login to leave a review." });
      return;
    }

    const payload = { rating, comment };
    if (editingReview) {
      await updateMutation.mutateAsync({ reviewId: editingReview._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    await deleteMutation.mutateAsync(reviewId);
  };

  const userCanReview = !!user && !authLoading;
  const requestOpenDialog = () => {
    if (!userCanReview) {
      toast({ title: "Login required", description: "Please login to write a review." });
      return;
    }
    handleResetForm();
    setIsDialogOpen(true);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (value: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${onChange ? "cursor-pointer" : ""} ${
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          }`}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );

  const reviewList = reviews ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => (!open ? closeDialog() : undefined)}>
          <DialogTrigger asChild>
            <Button
              onClick={(event) => {
                event.preventDefault();
                requestOpenDialog();
              }}
              disabled={!userCanReview}
            >
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReview ? "Edit Review" : "Write a Review"}</DialogTitle>
              <DialogDescription>Share your experience with this campground</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this campground..."
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner label="Saving" /> : editingReview ? "Update Review" : "Submit Review"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {!user && !authLoading && (
        <Alert>
          <AlertTitle>Login to review</AlertTitle>
          <AlertDescription>
            You need to be signed in and have a booking for this campground before leaving a review.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner label="Loading reviews" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load reviews</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      ) : reviewList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewList.map((review) => {
            const canManage = user && (review.user._id === user._id || user.role === "admin");
            return (
              <Card key={review._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{review.user.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <StarRating value={review.rating} />
                        <span className="text-xs">• {new Date(review.createdAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" disabled={deleteMutation.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(review._id)}>
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
                  <p className="text-muted-foreground whitespace-pre-line">{review.comment}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
