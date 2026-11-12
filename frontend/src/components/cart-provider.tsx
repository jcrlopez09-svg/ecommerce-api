"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";

/**
 * Carrito de compras con estado local (React Context) y persistencia
 * en localStorage. El token/usuario NUNCA se guarda aquí: solo productos.
 */

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ecom_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Cargar desde localStorage tras el montaje (evita mismatch de hidratación).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // localStorage no disponible: el carrito vive solo en memoria.
    }
    setReady(true);
  }, []);

  // Persistir en cada cambio.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorar errores de cuota/privacidad.
    }
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((i) => i.id === item.id);
        if (existing) {
          const max = item.stock > 0 ? item.stock : existing.quantity;
          return current.map((i) =>
            i.id === item.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, max) }
              : i,
          );
        }
        return [...current, { ...item, quantity: Math.min(quantity, item.stock) }];
      });
    },
    [],
  );

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.id !== id)
        : current.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(quantity, i.stock > 0 ? i.stock : quantity) }
              : i,
          ),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, ready, count, total, addItem, updateQuantity, removeItem, clear };
  }, [items, ready, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}
