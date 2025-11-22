import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "@/services/bookings";
import { Booking } from "@/types";
import { Pencil } from "lucide-react";

interface EditBookingDialogProps {
  booking: Booking;
}

export function EditBookingDialog({ booking }: EditBookingDialogProps) {
  const [open, setOpen] = useState(false);
  // Initialize with the booking date, formatted for input type="date" (YYYY-MM-DD)
  const [date, setDate] = useState(
    booking.bookingDate ? new Date(booking.bookingDate).toISOString().split("T")[0] : ""
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (newDate: string) => updateBooking(booking._id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking updated",
        description: "Your booking date has been successfully updated.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!date) return;
    updateMutation.mutate(date);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Change the date for your booking at {booking.campground.name}.
          </DialogDescription>
          {booking.campground.image && (
            <div className="w-full h-32 relative mt-2 rounded-md overflow-hidden">
              <img
                src={booking.campground.image}
                alt={booking.campground.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
