import api from './api';
import type { LoginDto, RegisterCustomerDto, RegisterDeliveryDto, AuthResponse } from '../types';

export const authService = {
  // Customer Registration
  registerCustomer: async (data: RegisterCustomerDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/customer', data);
    return response.data;
  },

  // Delivery Person Registration
  registerDelivery: async (data: RegisterDeliveryDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/delivery', data);
    return response.data;
  },

  // Login
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Reset Password
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },
};