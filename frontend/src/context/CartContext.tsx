import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Cart } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (productId: number, variantId?: number, quantity?: number) => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, variantId?: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to your cart', 'warning', 'Authentication Required');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/cart/items', { productId, variantId, quantity });
      setCart(res.data);
      showToast('Added item to cart!', 'success');
      setIsOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      showToast(msg, 'error', 'Cart Error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update item quantity';
      showToast(msg, 'error', 'Cart Error');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setLoading(true);
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      setLoading(true);
      const res = await api.post(`/cart/apply-coupon?code=${encodeURIComponent(code)}`);
      setCart(res.data);
      showToast(`Coupon "${code}" applied successfully!`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or inapplicable coupon';
      showToast(msg, 'error', 'Coupon Rejected');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        isOpen,
        setIsOpen,
        addToCart,
        addItem: (productId: number, quantity?: number) => addToCart(productId, undefined, quantity),
        updateQuantity,
        removeItem,
        applyCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
