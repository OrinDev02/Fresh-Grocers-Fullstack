import api from './api';
import type { Order, DeliveryAddress } from '../types';

export const ordersService = {
  // Create order (checkout)
  createOrder: async (deliveryAddress: DeliveryAddress): Promise<Order> => {
    const response = await api.post<Order>('/orders', { deliveryAddress });
    return response.data;
  },

  // Get user's orders
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // Assign delivery person (CSR only)
  assignDeliveryPerson: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/assign`, {
      deliveryPersonId,
    });
    return response.data;
  },

  // Accept order (Delivery Person only)
  acceptOrder: async (orderId: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/accept`);
    return response.data;
  },

  // Reject order (Delivery Person only)
  rejectOrder: async (orderId: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/reject`);
    return response.data;
  },

  // Mark as delivered (Delivery Person only)
  markDelivered: async (orderId: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/deliver`);
    return response.data;
  },

  // Get order statistics (CSR only)
  getOrderStats: async (): Promise<any> => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};