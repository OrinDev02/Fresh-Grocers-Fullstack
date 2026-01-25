import type { UserRole } from '../types';

export const ROUTES = {
  // Auth
  FLASH: '/',
  SELECT_ROLE: '/select-role',
  LOGIN: '/login',
  LOGIN_CUSTOMER: '/login/customer',
  LOGIN_DELIVERY: '/login/delivery',
  LOGIN_CSR: '/login/csr',
  REGISTER_CUSTOMER: '/register/customer',
  REGISTER_DELIVERY: '/register/delivery',
  
  // Customer
  CUSTOMER_HOME: '/customer',
  CUSTOMER_PRODUCTS: '/customer/products',
  CUSTOMER_CART: '/customer/cart',
  CUSTOMER_ORDERS: '/customer/orders',
  CUSTOMER_PROFILE: '/customer/profile',
  
  // Delivery
  DELIVERY_DASHBOARD: '/delivery',
  DELIVERY_ORDERS: '/delivery/orders',
  DELIVERY_STATS: '/delivery/stats',
  DELIVERY_PROFILE: '/delivery/profile',
  
  // CSR
  CSR_DASHBOARD: '/csr',
  CSR_ORDERS: '/csr/orders',
  CSR_APPROVALS: '/csr/approvals',
  CSR_PRODUCTS: '/csr/products',
  CSR_CATEGORIES: '/csr/categories',
  CSR_USERS: '/csr/users',
};

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER' as UserRole,
  DELIVERY_PERSON: 'DELIVERY_PERSON' as UserRole,
  CSR: 'CSR' as UserRole,
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};