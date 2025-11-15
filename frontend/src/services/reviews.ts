import { apiFetch, ApiListResponse, ApiResponse } from "@/lib/api";
import { Review, ReviewInput } from "@/types";

export const fetchReviews = async (campgroundId: string) => {
  const response = await apiFetch<ApiListResponse<Review>>(
    `/campgrounds/${campgroundId}/reviews`,
    { skipAuth: true },
  );
  return response.data;
};

export const createReview = (campgroundId: string, payload: ReviewInput) =>
  apiFetch<ApiResponse<Review>>(`/campgrounds/${campgroundId}/reviews`, {
    method: "POST",
    json: payload,
  });

export const updateReview = (reviewId: string, payload: ReviewInput) =>
  apiFetch<ApiResponse<Review>>(`/reviews/${reviewId}`, {
    method: "PUT",
    json: payload,
  });

export const deleteReview = (reviewId: string) =>
  apiFetch<ApiResponse<unknown>>(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
