import { useState } from "react";
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
import { Review } from "@/types";

interface ReviewSectionProps {
  campgroundId: string;
  reviews: Review[];
  currentUserId?: string;
}

const ReviewSection = ({ campgroundId, reviews, currentUserId = "user1" }: ReviewSectionProps) => {
  const { toast } = useToast();
  const [localReviews, setLocalReviews] = useState(reviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const campgroundReviews = localReviews.filter(r => r.campgroundId === campgroundId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReview) {
      setLocalReviews(localReviews.map(r => 
        r.id === editingReview.id 
          ? { ...r, rating, comment }
          : r
      ));
      toast({
        title: "Success",
        description: "Review updated successfully!",
      });
    } else {
      const newReview: Review = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: "Current User",
        campgroundId,
        rating,
        comment,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLocalReviews([...localReviews, newReview]);
      toast({
        title: "Success",
        description: "Review added successfully!",
      });
    }

    setIsDialogOpen(false);
    setEditingReview(null);
    setRating(5);
    setComment("");
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setIsDialogOpen(true);
  };

  const handleDelete = (reviewId: string) => {
    setLocalReviews(localReviews.filter(r => r.id !== reviewId));
    toast({
      title: "Success",
      description: "Review deleted successfully",
    });
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (value: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${onChange ? 'cursor-pointer' : ''} ${
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingReview(null);
              setRating(5);
              setComment("");
            }}>
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReview ? 'Edit Review' : 'Write a Review'}</DialogTitle>
              <DialogDescription>
                Share your experience with this campground
              </DialogDescription>
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
              <Button type="submit" className="w-full">
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {campgroundReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          campgroundReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.userName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <StarRating value={review.rating} />
                      <span className="text-xs">• {review.createdAt}</span>
                    </CardDescription>
                  </div>
                  {review.userId === currentUserId && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(review)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
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
                            <AlertDialogAction onClick={() => handleDelete(review.id)}>
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
                <p className="text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
