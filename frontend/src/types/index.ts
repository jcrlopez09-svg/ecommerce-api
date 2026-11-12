/**
 * Tipos que representan los recursos devueltos por la API Laravel.
 * Ver README de la API: los valores monetarios llegan como string (decimal:2).
 */

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  product?: Product;
}

export type PaymentStatus = "pending" | "succeeded" | "failed";
export type OrderStatus = "pending" | "paid";

export interface Payment {
  id: number;
  order_id: number;
  provider: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payments?: Payment[];
}

/** Envoltura estándar de todas las respuestas de la API. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/** Ítem del carrito en estado local (cliente). */
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}
