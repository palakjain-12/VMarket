// TypeScript interfaces matching your backend DTOs
export interface Shopkeeper {
  id: string;
  email: string;
  name: string;
  phone?: string;
  shopName: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  availableQuantity?: number;
  expiryDate?: string;
  category?: string;
  shopkeeperId: string;
  shopkeeper?: Shopkeeper;
}

export interface ExportRequest {
  id: string;
  productId: string;
  toShopId: string;
  quantity: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  product?: Product;
  fromShop?: Shopkeeper;
  toShop?: Shopkeeper;
}

export interface AuthResponse {
  access_token: string;
  shopkeeper: Shopkeeper;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  shopName: string;
  address: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  expiryDate?: string;
  category?: string;
}