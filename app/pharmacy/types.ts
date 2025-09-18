export type ActiveSection = "dashboard" | "notifications" | "inventory" | "orders";

export interface Profile {
  ownerName: string;
  shopName: string;
  phone: string;
  address: string;
  license: string;
  email: string;
}

export interface Item {
  id: string;
  name: string;
  qty: number;
  price?: number;
  category?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  // Some API responses use "quantity"; components should handle both if needed when displaying
  // without changing backend.
  quantity?: number;
}

export interface Notification {
  id: string;
  patientName: string;
  patientPhone?: string;
  items: OrderItem[];
  pickup?: "delivery" | "pickup" | string;
  address?: string;
  timestamp?: Date;
}

export interface Order {
  id: string;
  patientName: string;
  items: OrderItem[];
  pickup?: "delivery" | "pickup" | string;
  status: "pending" | "ready" | "completed" | string;
}


