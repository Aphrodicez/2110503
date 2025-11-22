import { apiFetch, ApiResponse } from "@/lib/api";
import { Booking } from "@/types";

export interface CheckoutSessionPayload {
  bookingDate: string;
  campgroundId: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export const createCheckoutSession = (payload: CheckoutSessionPayload) =>
  apiFetch<CheckoutSessionResponse>("/payments/create-checkout-session", {
    method: "POST",
    json: payload,
  });

export const createPaymentIntent = (amount: number) =>
  apiFetch<{ clientSecret: string }>("/payments/create-payment-intent", {
    method: "POST",
    json: { amount },
  });

export const finalizeCheckoutBooking = (sessionId: string) =>
  apiFetch<ApiResponse<Booking> & { alreadyExists?: boolean }>(
    "/payments/finalize-booking",
    {
      method: "POST",
      json: { sessionId },
    }
  );
