import axios, { AxiosRequestConfig } from "axios";
import {
  AuthResponse,
  LoginData,
  RegisterData,
  Product,
  CreateProductData,
  Shopkeeper,
  ExportRequest,
} from "../types";

// Use environment variable or fallback to default URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Utility function to add cache-busting headers
const addCacheBusting = (
  config: AxiosRequestConfig = {},
): AxiosRequestConfig => {
  // Generate a random string for cache busting
  const randomValue = Math.random().toString(36).substring(2, 15);

  return {
    ...config,
    headers: {
      ...config.headers,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      // Use a random value instead of timestamp to avoid potential issues
      "If-None-Match": randomValue,
    },
  };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized errors gracefully
let hasRedirected401 = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !hasRedirected401) {
      hasRedirected401 = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login"); // Redirect without stacking history
    }
    return Promise.reject(error);
  },
);

// =======================
// Auth Service
// =======================
export const authService = {
  login: (data: LoginData): Promise<AuthResponse> =>
    api.post("/auth/login", data).then((res) => res.data),

  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post("/auth/register", data).then((res) => res.data),

  getProfile: (): Promise<Shopkeeper> =>
    api.get("/auth/profile", addCacheBusting()).then((res) => res.data),
};

// =======================
// Shopkeeper Service
// =======================
export const shopkeeperService = {
  getAll: (
    page = 1,
    limit = 10,
  ): Promise<{ data: Shopkeeper[]; total: number }> =>
    api
      .get(`/shopkeepers?page=${page}&limit=${limit}`, addCacheBusting())
      .then((res) => res.data),

  getById: (id: string): Promise<Shopkeeper> =>
    api.get(`/shopkeepers/${id}`, addCacheBusting()).then((res) => res.data),
};

// =======================
// Product Service
// =======================
export const productService = {
  getAll: (page = 1, limit = 10): Promise<{ data: Product[]; total: number }> =>
    api
      .get(`/products?page=${page}&limit=${limit}`, addCacheBusting())
      .then((res) => res.data),

  getMyProducts: (
    page = 1,
    limit = 10,
  ): Promise<{ data: Product[]; total: number }> => {
    // Use cache-busting utility
    return api
      .get(
        `/products/my-products?page=${page}&limit=${limit}`,
        addCacheBusting(),
      )
      .then((res) => res.data);
  },

  getByShop: (
    shopId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Product[]; total: number }> =>
    api
      .get(
        `/products/shop/${shopId}?page=${page}&limit=${limit}`,
        addCacheBusting(),
      )
      .then((res) => res.data),

  getById: (id: string): Promise<Product> => {
    // Use cache-busting utility
    return api
      .get(`/products/${id}`, addCacheBusting())
      .then((res) => res.data);
  },

  create: (data: CreateProductData): Promise<Product> =>
    api.post("/products", data).then((res) => res.data),

  update: (id: string, data: Partial<CreateProductData>): Promise<Product> =>
    api.patch(`/products/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/products/${id}`).then((res) => res.data),
};

// =======================
// Export Request Service
// =======================
export const exportRequestService = {
  create: (data: {
    productId: string;
    toShopId: string;
    quantity: number;
    message?: string;
  }): Promise<ExportRequest> =>
    api.post("/export-requests", data).then((res) => res.data),

  getReceived: (
    page = 1,
    limit = 10,
  ): Promise<{ data: ExportRequest[]; total: number }> => {
    // Use cache-busting utility
    return api
      .get(
        `/export-requests/received?page=${page}&limit=${limit}`,
        addCacheBusting(),
      )
      .then((res) => res.data);
  },

  getSent: (
    page = 1,
    limit = 10,
  ): Promise<{ data: ExportRequest[]; total: number }> => {
    // Use cache-busting utility
    return api
      .get(
        `/export-requests/sent?page=${page}&limit=${limit}`,
        addCacheBusting(),
      )
      .then((res) => res.data);
  },

  accept: (id: string, message?: string): Promise<ExportRequest> =>
    api
      .patch(`/export-requests/${id}/accept`, { message })
      .then((res) => res.data),

  reject: (id: string): Promise<ExportRequest> =>
    api.patch(`/export-requests/${id}/reject`).then((res) => res.data),
};
