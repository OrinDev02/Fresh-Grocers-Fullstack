import api from './api';
import type { DeliveryProfile } from '../types';

export const deliveryService = {
  // Get delivery person profile
  getProfile: async (): Promise<DeliveryProfile> => {
    const response = await api.get<DeliveryProfile>('/delivery/profile');
    return response.data;
  },

  // Update delivery person profile
  updateProfile: async (data: Partial<DeliveryProfile>): Promise<DeliveryProfile> => {
    const response = await api.put<DeliveryProfile>('/delivery/profile', data);
    return response.data;
  },

  // Get approval status
  getApprovalStatus: async (): Promise<DeliveryProfile> => {
    const response = await api.get<DeliveryProfile>('/delivery/approval-status');
    return response.data;
  },

  // Approve delivery person (CSR only)
  approveDeliveryPerson: async (id: string): Promise<DeliveryProfile> => {
    const response = await api.post<DeliveryProfile>(`/delivery/approve/${id}`, { status: 'APPROVED' });
    return response.data;
  },

  // Reject delivery person (CSR only)
  rejectDeliveryPerson: async (id: string): Promise<DeliveryProfile> => {
    const response = await api.post<DeliveryProfile>(`/delivery/approve/${id}`, { status: 'REJECTED' });
    return response.data;
  },

  // Find nearby delivery persons (CSR only)
  findNearby: async (latitude: number, longitude: number, radius?: number, district?: string): Promise<DeliveryProfile[]> => {
    const response = await api.get<DeliveryProfile[]>('/delivery/nearby', {
      params: { latitude, longitude, radius: radius || 5, district },
    });
    return response.data;
  },

  // Get delivery stats
  getStats: async (): Promise<any> => {
    const response = await api.get('/delivery/stats');
    return response.data;
  },

  // Get all approved delivery persons (CSR only)
  getDeliveryPersons: async (): Promise<any[]> => {
    const response = await api.get('/delivery/approved');
    return response.data || [];
  },
};