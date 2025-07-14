import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, Product, CreateProductData, Shopkeeper, ExportRequest } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data: LoginData): Promise<AuthResponse> => 
    api.post('/auth/login', data).then(res => res.data),
  
  register: (data: RegisterData): Promise<AuthResponse> => 
    api.post('/auth/register', data).then(res => res.data),
  
  getProfile: () => 
    api.get('/auth/profile').then(res => res.data),
};

export const shopkeeperService = {
  getAll: (page = 1, limit = 10): Promise<{ data: Shopkeeper[]; total: number }> =>
    api.get(`/shopkeepers?page=${page}&limit=${limit}`).then(res => res.data),
  
  getById: (id: string): Promise<Shopkeeper> =>
    api.get(`/shopkeepers/${id}`).then(res => res.data),
};

export const productService = {
  getAll: (page = 1, limit = 10): Promise<{ data: Product[]; total: number }> =>
    api.get(`/products?page=${page}&limit=${limit}`).then(res => res.data),
  
  getMyProducts: (page = 1, limit = 10): Promise<{ data: Product[]; total: number }> =>
    api.get(`/products/my-products?page=${page}&limit=${limit}`).then(res => res.data),
  
  getByShop: (shopId: string, page = 1, limit = 10): Promise<{ data: Product[]; total: number }> =>
    api.get(`/products/shop/${shopId}?page=${page}&limit=${limit}`).then(res => res.data),
  
  getById: (id: string): Promise<Product> =>
    api.get(`/products/${id}`).then(res => res.data),
  
  create: (data: CreateProductData): Promise<Product> =>
    api.post('/products', data).then(res => res.data),
  
  update: (id: string, data: Partial<CreateProductData>): Promise<Product> =>
    api.patch(`/products/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/products/${id}`).then(res => res.data),
};

export const exportRequestService = {
  create: (data: { productId: string; toShopId: string; quantity: number; message?: string }): Promise<ExportRequest> =>
    api.post('/export-requests', data).then(res => res.data),
  
  getReceived: (page = 1, limit = 10): Promise<{ data: ExportRequest[]; total: number }> =>
    api.get(`/export-requests/received?page=${page}&limit=${limit}`).then(res => res.data),
  
  getSent: (page = 1, limit = 10): Promise<{ data: ExportRequest[]; total: number }> =>
    api.get(`/export-requests/sent?page=${page}&limit=${limit}`).then(res => res.data),
  
  accept: (id: string): Promise<ExportRequest> =>
    api.patch(`/export-requests/${id}/accept`).then(res => res.data),
  
  reject: (id: string): Promise<ExportRequest> =>
    api.patch(`/export-requests/${id}/reject`).then(res => res.data),
};