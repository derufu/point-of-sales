export type Category = 'Hot Coffee' | 'Iced Coffee' | 'Non-Coffee' | 'Pastries' | 'Sandwiches';
export type PosCategory = 'All' | Category;
export type PaymentMethod = 'cash' | 'gcash' | 'card';
export type Size = 'S' | 'M' | 'L';
export type OrderStatus = 'completed' | 'pending' | 'cancelled' | 'ready' | 'making' | 'queued';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  basePrice: number;
  sizeM: number;
  sizeL: number;
  hasSizes: boolean;
  emoji: string;
  description: string;
  available: boolean;
  cost: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  size?: Size;
  price: number;
  qty: number;
  note?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountPercent: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  promoCode?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minLevel: number;
  costPerUnit: number;
  supplier?: string;
}

export interface Promo {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  active: boolean;
  minOrder?: number;
  expiresAt?: string;
}

export const TAX_RATE = 0.12;

export const SIZE_ADDERS: Record<Size, number> = { S: 0, M: 20, L: 40 };

export const DISCOUNTS = [
  { label: 'PWD / Senior (20%)', value: 0.2 },
  { label: 'Student (10%)', value: 0.1 },
  { label: 'Staff (15%)', value: 0.15 },
] as const;
