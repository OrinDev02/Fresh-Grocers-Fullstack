import api from './api';
import type { Category } from '../types';

export const categoriesService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  // Get single category with products
  getCategory: async (id: string): Promise<Category & { products?: any[] }> => {
    const response = await api.get<Category & { products?: any[] }>(`/categories/${id}`);
    return response.data;
  },

  // Create category (CSR only)
  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  // Update category (CSR only)
  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category (CSR only)
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};