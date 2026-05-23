export interface MenuItem {
  name: string;
  description: string;
  price: number;
}

export interface PeerRecommendation {
  count: number;
  names: string[];
}

export interface AmbiancePhoto {
  emoji: string;
  label: string;
}

export interface AmbianceInfo {
  vibe: string;
  lighting: string;
  photos: AmbiancePhoto[];
}

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
  dietaryTags: string[];
  menuItems: MenuItem[];
  peerRecommendations: PeerRecommendation | null;
  ambiance: AmbianceInfo;
  lat: number;
  lng: number;
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

export interface UserPreferences {
  favoriteCuisine: string | null;
  priceRange: "$" | "$$" | "$$$" | "$$$$" | null;
  dietaryRestrictions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  favorites: string[];
  preferences: UserPreferences;
}
