import api from './api';
import type { Cart } from '../types';

export const cartService = {
  // Get user's cart
  getCart: async (): Promise<Cart> => {
    const response = await api.get<Cart>('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await api.post<Cart>('/cart/add', { productId, quantity });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await api.put<Cart>(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<Cart> => {
    const response = await api.delete<Cart>(`/cart/remove/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    await api.delete('/cart/clear');
  },
};