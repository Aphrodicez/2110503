import { apiFetch, ApiListResponse, ApiResponse, AUTH_TOKEN_KEY } from "@/lib/api";
import { Booking } from "@/types";

export const fetchBookings = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return [];
  }
  const response = await apiFetch<ApiListResponse<Booking>>("/bookings");
  return response.data;
};

export const createBooking = (campgroundId: string, bookingDate: string) =>
  apiFetch<ApiResponse<Booking>>(`/campgrounds/${campgroundId}/bookings`, {
    method: "POST",
    json: { bookingDate },
  });

export const deleteBooking = (bookingId: string) =>
  apiFetch<ApiResponse<unknown>>(`/bookings/${bookingId}`, {
    method: "DELETE",
  });
