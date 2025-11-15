import { Campground, Booking, Review } from "@/types";

export const mockCampgrounds: Campground[] = [
  {
    id: "1",
    name: "Pine Valley Campground",
    address: "123 Forest Road, Mountain View, CA 94040",
    telephone: "(555) 123-4567",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
    description: "Nestled in a beautiful pine forest with hiking trails and river access.",
  },
  {
    id: "2",
    name: "Lakeside Retreat",
    address: "456 Lake Shore Drive, Blue Lake, CA 95525",
    telephone: "(555) 234-5678",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800",
    description: "Peaceful lakeside camping with swimming and fishing opportunities.",
  },
  {
    id: "3",
    name: "Mountain Peak Campsite",
    address: "789 Summit Trail, Peak City, CO 80401",
    telephone: "(555) 345-6789",
    image: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800",
    description: "High-altitude camping with stunning mountain views and stargazing.",
  },
  {
    id: "4",
    name: "Riverside Haven",
    address: "321 River Bend Road, Waterford, OR 97001",
    telephone: "(555) 456-7890",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800",
    description: "Tranquil riverside location perfect for kayaking and nature walks.",
  },
  {
    id: "5",
    name: "Desert Oasis Camp",
    address: "654 Canyon Road, Desert Springs, AZ 85001",
    telephone: "(555) 567-8901",
    image: "https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=800",
    description: "Unique desert experience with stunning rock formations and sunsets.",
  },
  {
    id: "6",
    name: "Coastal Breeze Campground",
    address: "987 Ocean View Blvd, Seaside, CA 93955",
    telephone: "(555) 678-9012",
    image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800",
    description: "Beachside camping with ocean views and coastal hiking trails.",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    campgroundId: "1",
    campgroundName: "Pine Valley Campground",
    checkIn: "2025-12-01",
    checkOut: "2025-12-02",
    nights: 1,
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    campgroundId: "1",
    rating: 5,
    comment: "Amazing experience! The pine forest was breathtaking and the facilities were top-notch.",
    createdAt: "2025-11-10",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Jane Smith",
    campgroundId: "1",
    rating: 4,
    comment: "Great location and well-maintained trails. Would definitely come back!",
    createdAt: "2025-11-12",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Johnson",
    campgroundId: "2",
    rating: 5,
    comment: "Perfect lakeside retreat. Fishing was excellent and the sunset views were spectacular.",
    createdAt: "2025-11-08",
  },
];
