import { apiFetch, ApiListResponse, ApiResponse } from "@/lib/api";
import { Review, ReviewSummary } from "@/types";

interface ReviewListResponse extends ApiListResponse<Review> {
  meta?: ReviewSummary;
}

export const fetchCampgroundReviews = async (campgroundId: string) => {
  const response = await apiFetch<ReviewListResponse>(
    `/campgrounds/${campgroundId}/reviews`
  );
  return {
    reviews: response.data,
    summary: response.meta ?? {
      campgroundId,
      reviewsCount: response.data.length,
      averageRating:
        response.data.length > 0
          ? Number(
              (
                response.data.reduce(
                  (total, review) => total + review.rating,
                  0
                ) / response.data.length
              ).toFixed(2)
            )
          : 0,
    },
  };
};

export const fetchReviews = async () => {
  const response = await apiFetch<ApiListResponse<Review>>("/reviews");
  return response.data;
};

export const createReview = (
  campgroundId: string,
  payload: { rating: number; comment: string }
) =>
  apiFetch<ApiResponse<Review>>(`/campgrounds/${campgroundId}/reviews`, {
    method: "POST",
    json: payload,
  });

export const updateReview = (
  reviewId: string,
  payload: { rating?: number; comment?: string }
) =>
  apiFetch<ApiResponse<Review>>(`/reviews/${reviewId}`, {
    method: "PUT",
    json: payload,
  });

export const deleteReview = (reviewId: string) =>
  apiFetch<ApiResponse<unknown>>(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
