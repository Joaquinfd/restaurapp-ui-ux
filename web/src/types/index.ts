export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  address: string;
  openingHours: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  favorites: string[];
}
