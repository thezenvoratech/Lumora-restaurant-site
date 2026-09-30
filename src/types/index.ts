export type DietaryTag = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';
export type Category =
  | 'starters'
  | 'main-course'
  | 'indian'
  | 'asian'
  | 'continental'
  | 'desserts'
  | 'drinks'
  | 'chefs-specials';

export interface Dish {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: Category[];
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  dietary: DietaryTag[];
  spiceLevel: SpiceLevel;
  prepTime: number;
  popularity: number;
  nutrition?: { calories: number; protein: number; carbs: number; fat: number };
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  specialInstructions?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  favorites: string[];
  createdAt: string;
  emailVerified?: boolean;
  role?: 'user' | 'admin';
}

export interface Reservation {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  seating: 'indoor' | 'outdoor' | 'window' | 'private';
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'upi' | 'card' | 'online';
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  dishId?: string;
  rating: number;
  comment: string;
  image?: string;
  date: string;
  orderId?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  image: string;
  capacity: number;
  booked: number;
  location: string;
}
