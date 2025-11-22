import { apiFetch, ApiResponse } from "@/lib/api";
import { Booking } from "@/types";

export interface CheckoutSessionPayload {
  bookingDate: string;
  campgroundId: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

// ...existing code...
export const createCheckoutSession = (payload: CheckoutSessionPayload) =>
  apiFetch<CheckoutSessionResponse>("/payments/create-checkout-session", {
    method: "POST",
    json: payload,
  });

export const finalizeCheckoutBooking = (sessionId: string) =>
  // ...existing code...
  apiFetch<ApiResponse<Booking> & { alreadyExists?: boolean }>(
    "/payments/finalize-booking",
    {
      method: "POST",
      json: { sessionId },
    }
  );
