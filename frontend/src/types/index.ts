export interface Campground {
  _id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel?: string;
  region: string;
  image?: string;
  price?: number;
  createdAt?: string;
  bookings?: Booking[];
  averageRating?: number;
  reviewsCount?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  telephone?: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface Booking {
  _id: string;
  bookingDate: string;
  paymentStatus?: "pending" | "paid";
  campground: Campground;
  user: User;
  createdAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  campground: string | Pick<Campground, "_id" | "name">;
  user: Pick<User, "_id" | "name">;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  campgroundId: string;
  averageRating: number;
  reviewsCount: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentials {
  name: string;
  telephone?: string;
}

export interface ApiError {
  message: string;
}
