import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/RatingStars";
import { Review } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { createReview, updateReview } from "@/services/reviews";

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campgroundId: string;
  review?: Review | null;
  onSuccess?: () => void;
}

const ReviewFormDialog = ({
  open,
  onOpenChange,
  campgroundId,
  review,
  onSuccess,
}: ReviewFormDialogProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");

  useEffect(() => {
    if (open) {
      setRating(review?.rating ?? 5);
      setComment(review?.comment ?? "");
    }
  }, [open, review]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { rating, comment };
      if (review) {
        return updateReview(review._id, payload);
      }
      return createReview(campgroundId, payload);
    },
    onSuccess: () => {
      toast({
        title: review ? "Review updated" : "Review submitted",
        description: review
          ? "Thanks for keeping your feedback up to date."
          : "Thanks for sharing your experience!",
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to save review";
      toast({
        title: "Review failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating || rating < 1) {
      toast({
        title: "Rating required",
        description: "Please select a rating.",
      });
      return;
    }
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a short review.",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {review ? "Edit your review" : "Write a review"}
          </DialogTitle>
          <DialogDescription>
            Share an honest rating and a short comment about this campground.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <RatingStars rating={rating} size="lg" onSelect={setRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell others what to expect..."
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : review
              ? "Update review"
              : "Submit review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormDialog;
