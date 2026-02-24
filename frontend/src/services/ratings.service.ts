import api from './api';
import type { Rating } from '../types';

export const ratingsService = {
  // Create rating
  createRating: async (orderId: string, deliveryPersonId: string, rating: number, comment?: string): Promise<Rating> => {
    // deliveryPersonId is sent but backend will use the one from order
    const response = await api.post<Rating>('/ratings', {
      orderId,
      rating,
      comment,
    });
    return response.data;
  },

  // Get delivery person ratings
  getDeliveryPersonRatings: async (deliveryPersonId: string): Promise<Rating[]> => {
    const response = await api.get<Rating[]>(`/ratings/delivery-person/${deliveryPersonId}`);
    return response.data;
  },

  // Check if order is rated
  getOrderRating: async (orderId: string): Promise<Rating | null> => {
    try {
      const response = await api.get<{ isRated: boolean; rating: Rating | null }>(`/ratings/order/${orderId}`);
      return response.data.rating;
    } catch (error) {
      console.error('Error fetching order rating:', error);
      return null;
    }
  },
};