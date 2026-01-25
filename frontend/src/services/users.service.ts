import api from './api';
import type { User } from '../types';

export const usersService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },

  // Get all customers (CSR only)
  getAllCustomers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/customers');
    return response.data;
  },

  // Get all delivery persons (CSR only)
  getAllDeliveryPersons: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/delivery-persons');
    return response.data;
  },
};