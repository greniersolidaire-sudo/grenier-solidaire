'use client';
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

type CartItem = {
  productId: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  tier: 'detail' | 'gros';
  imageUrl?: string;
};

type CartContextType = {
  cart: Record<string, CartItem>;
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const addItem = useCallback((item: CartItem) => {
    setCart(prev => ({ ...prev, [item.productId]: item }));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => { const next = { ...prev }; delete next[productId]; return next; });
      return;
    }
    setCart(prev => prev[productId]
      ? { ...prev, [productId]: { ...prev[productId], qty } }
      : prev
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart(prev => { const next = { ...prev }; delete next[productId]; return next; });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const items = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = items.length;

  return (
    <CartContext.Provider value={{ cart, items, count, total, addItem, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
