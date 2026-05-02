import { api } from "./client";
import type { Society, User, Dish, Order, ChefAnalytics, MealSlot } from "../types";

export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    role: string;
    societyId: string;
  }) => api.post<{ userId: string }>("/auth/register", body),

  login: (body: { email: string; password: string }) =>
    api.post<{ accessToken: string }>("/auth/login", body),

  logout: () => api.post("/auth/logout"),

  profile: () => api.get<User>("/auth/profile"),

  refresh: () => api.post<{ accessToken: string }>("/auth/refresh"),
};

export const userApi = {
  me: () => api.get<{ user: User }>("/users/me"),
  updateProfile: (name: string) => api.patch("/users/me", { name }),
  updateLocation: (lat: number, lng: number) =>
    api.patch("/users/me/location", { lat, lng }),
};

export const societyApi = {
  list: () => api.get<{ societies: Society[] }>("/societies"),
  getById: (id: string) => api.get<{ society: Society }>(`/societies/${id}`),
  create: (name: string) => api.post<{ society: Society }>("/societies", { name }),
};

export const dishApi = {
  create: (body: {
    name: string;
    price: number;
    quantity: number;
    mediaUrl?: string;
    mealSlot?: MealSlot;
  }) => api.post<{ dish: Dish }>("/dishes", body),

  myDishes: () => api.get<{ dishes: Dish[] }>("/dishes/my"),

  analytics: () => api.get<{ analytics: ChefAnalytics }>("/dishes/analytics"),

  getById: (id: string) => api.get<{ dish: Dish }>(`/dishes/${id}`),

  update: (
    id: string,
    body: Partial<{ name: string; price: number; quantity: number; mediaUrl: string; mealSlot: MealSlot }>
  ) => api.patch<{ dish: Dish }>(`/dishes/${id}`, body),

  markSoldOut: (id: string) =>
    api.patch<{ dish: Dish }>(`/dishes/${id}/sold-out`),

  restock: (id: string, quantity: number) =>
    api.patch<{ dish: Dish }>(`/dishes/${id}/restock`, { quantity }),
};

export const feedApi = {
  get: (params?: { veg?: boolean; highProtein?: boolean; lowCalorie?: boolean; mealSlot?: MealSlot }) => {
    const qs = new URLSearchParams();
    if (params?.veg) qs.set("veg", "true");
    if (params?.highProtein) qs.set("highProtein", "true");
    if (params?.lowCalorie) qs.set("lowCalorie", "true");
    if (params?.mealSlot && params.mealSlot !== "ANY") qs.set("mealSlot", params.mealSlot);
    const q = qs.toString();
    return api.get<{ dishes: Dish[] }>(`/feed${q ? `?${q}` : ""}`);
  },
};

export const orderApi = {
  place: (dishId: string) =>
    api.post<{ order: Order }>("/orders", { dishId }),

  myOrders: () => api.get<{ orders: Order[] }>("/orders/my"),

  cancel: (id: string) => api.delete<{ order: Order }>(`/orders/${id}`),
};

export const riderApi = {
  toggleAvailability: () =>
    api.patch<{ isAvailable: boolean }>("/rider/availability"),

  orders: () => api.get<{ orders: Order[] }>("/rider/orders"),

  accept: (orderId: string) =>
    api.post<{ order: Order }>(`/rider/orders/${orderId}/accept`),

  updateStatus: (orderId: string, status: "PICKED_UP" | "DELIVERED") =>
    api.patch<{ order: Order }>(`/rider/orders/${orderId}/status`, { status }),
};
