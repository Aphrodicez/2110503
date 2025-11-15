export interface Campground {
  _id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel?: string;
  region: string;
  createdAt?: string;
  bookings?: Booking[];
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
  campground: Campground;
  user: User;
  createdAt: string;
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
