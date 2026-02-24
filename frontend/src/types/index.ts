// User Types
export type UserRole = 'CUSTOMER' | 'DELIVERY_PERSON' | 'CSR';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive?: boolean;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterCustomerDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterDeliveryDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  vehicleType: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  _id?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: string;
}

// Order Types
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
}

export interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string | UserInfo;
  deliveryPersonId?: string | UserInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  assignedAt?: string;
  acceptedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Types
export interface DeliveryProfile {
  _id: string;
  userId: string | { _id: string; fullName: string; email: string; phone: string };
  city: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  vehicleType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  averageRating: number;
  totalRatings: number;
  totalDeliveries: number;
  totalEarnings: number;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

// Rating Types
export interface Rating {
  _id: string;
  orderId: string;
  customerId: string;
  deliveryPersonId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}