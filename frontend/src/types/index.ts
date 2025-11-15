export interface Campground {
  id: string;
  name: string;
  address: string;
  telephone: string;
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  campgroundId: string;
  campgroundName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  telephone: string;
  isAdmin: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  campgroundId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
