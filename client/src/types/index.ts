export type Role = "CHEF" | "RESIDENT" | "RIDER";
export type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "ANY";

export type OrderStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export interface Society {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  societyId: string;
  isAvailable?: boolean;
  lat?: number;
  lng?: number;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  quantity: number;
  mediaUrl?: string;
  calories?: number;
  healthScore?: number;
  isVeg: boolean;
  tags: string[];
  isSoldOut: boolean;
  mealSlot: MealSlot;
  chefId: string;
  societyId: string;
  createdAt: string;
  Chef?: { id: string; name: string };
}

export interface Order {
  id: string;
  status: OrderStatus;
  dishId: string;
  customerId: string;
  riderId?: string;
  societyId: string;
  createdAt: string;
  updatedAt: string;
  Dish?: Dish;
  Customer?: { id: string; name: string };
  Rider?: { id: string; name: string } | null;
}

export interface ChefAnalytics {
  totalDishes: number;
  activeDishes: number;
  totalOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  topDish: {
    id: string;
    name: string;
    price: number;
    orders: number;
    delivered: number;
    revenue: number;
    healthScore?: number | null;
    calories?: number | null;
    tags: string[];
  } | null;
  dishes: Array<{
    id: string;
    name: string;
    price: number;
    orders: number;
    delivered: number;
    revenue: number;
    healthScore?: number | null;
    calories?: number | null;
    tags: string[];
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}
