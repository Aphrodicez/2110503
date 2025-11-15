import { apiFetch, ApiListResponse, ApiResponse } from "@/lib/api";
import { Campground } from "@/types";

export const fetchCampgrounds = async () => {
  const response = await apiFetch<ApiListResponse<Campground>>("/campgrounds");
  return response.data;
};

export const fetchCampground = async (id: string) => {
  const response = await apiFetch<ApiResponse<Campground>>(`/campgrounds/${id}`);
  return response.data;
};
