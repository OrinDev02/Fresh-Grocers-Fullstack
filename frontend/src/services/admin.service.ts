import api from './api';

export const adminService = {
  // Get dashboard overview
  getDashboard: async (): Promise<any> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<any[]> => {
    const response = await api.get('/admin/pending-approvals');
    return response.data;
  },

  // Get all orders with filters
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Get platform statistics
  getStatistics: async (): Promise<any> => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },
};