export type MenuItemType = "Entrada" | "Plato principal" | "Postre" | "Bebida" | "Acompañamiento";

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  type: MenuItemType;
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

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  dietaryTags: string[];
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
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
  locationDetail?: string;
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

export type UserRole = "DINER" | "OWNER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  favorites: string[];
  ownedRestaurants: string[];
  preferences: UserPreferences;
}
