'use client';

import type { InventoryItem, MenuItem, OrderRecord, Promo } from './types';
import { DEFAULT_MENU_ITEMS } from './menu-data';

const KEYS = {
  menu: 'cafepos_menu',
  orders: 'cafepos_orders',
  orderCounter: 'cafepos_order_counter',
  inventory: 'cafepos_inventory',
  promos: 'cafepos_promos',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Oat milk', category: 'Dairy', quantity: 15, unit: 'cartons', minLevel: 20, costPerUnit: 180, supplier: 'Fresh Farms' },
  { id: 'i2', name: 'Espresso beans', category: 'Coffee', quantity: 22, unit: '%', minLevel: 25, costPerUnit: 850, supplier: 'Bean Bros' },
  { id: 'i3', name: 'Vanilla syrup', category: 'Syrups', quantity: 1, unit: 'bottles', minLevel: 3, costPerUnit: 320, supplier: 'Flavor Co' },
  { id: 'i4', name: 'Whole milk', category: 'Dairy', quantity: 28, unit: 'liters', minLevel: 15, costPerUnit: 95, supplier: 'Fresh Farms' },
  { id: 'i5', name: 'Paper cups (12oz)', category: 'Supplies', quantity: 450, unit: 'pcs', minLevel: 200, costPerUnit: 3.5, supplier: 'PackPro' },
  { id: 'i6', name: 'Croissant dough', category: 'Bakery', quantity: 35, unit: 'pcs', minLevel: 20, costPerUnit: 22, supplier: 'Bake House' },
  { id: 'i7', name: 'Matcha powder', category: 'Tea', quantity: 8, unit: 'tins', minLevel: 5, costPerUnit: 680, supplier: 'Tea Leaf' },
  { id: 'i8', name: 'Bacon strips', category: 'Food', quantity: 12, unit: 'packs', minLevel: 8, costPerUnit: 145, supplier: 'Meat Mart' },
];

export const DEFAULT_PROMOS: Promo[] = [
  { id: 'p1', code: 'MORNING10', description: '10% off before 10 AM', discountPercent: 10, active: true, minOrder: 100 },
  { id: 'p2', code: 'FREEDRINK', description: '15% off orders over ₱500', discountPercent: 15, active: true, minOrder: 500 },
  { id: 'p3', code: 'LOYALTY20', description: '20% loyalty discount', discountPercent: 20, active: true, minOrder: 200 },
  { id: 'p4', code: 'WELCOME5', description: '5% welcome discount', discountPercent: 5, active: false },
];

// ─── Menu ────────────────────────────────────────────────────────────────────

export function getMenuItems(): MenuItem[] {
  return read(KEYS.menu, DEFAULT_MENU_ITEMS);
}

export function saveMenuItems(items: MenuItem[]) {
  write(KEYS.menu, items);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function getOrders(): OrderRecord[] {
  return read<OrderRecord[]>(KEYS.orders, []);
}

export function saveOrder(order: OrderRecord) {
  const orders = getOrders();
  orders.unshift(order);
  write(KEYS.orders, orders.slice(0, 500));
}

export function getNextOrderNumber(): string {
  const current = read<number>(KEYS.orderCounter, 148);
  const next = current + 1;
  write(KEYS.orderCounter, next);
  return String(next).padStart(4, '0');
}

export function peekOrderNumber(): string {
  const current = read<number>(KEYS.orderCounter, 148);
  return String(current + 1).padStart(4, '0');
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function getInventory(): InventoryItem[] {
  return read(KEYS.inventory, DEFAULT_INVENTORY);
}

export function saveInventory(items: InventoryItem[]) {
  write(KEYS.inventory, items);
}

// ─── Promos ───────────────────────────────────────────────────────────────────

export function getPromos(): Promo[] {
  return read(KEYS.promos, DEFAULT_PROMOS);
}

export function savePromos(promos: Promo[]) {
  write(KEYS.promos, promos);
}

export function findPromo(code: string): Promo | undefined {
  const promos = getPromos();
  const promo = promos.find((p) => p.code.toUpperCase() === code.toUpperCase() && p.active);
  if (!promo) return undefined;
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return undefined;
  return promo;
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export function getTodayOrders(): OrderRecord[] {
  const today = new Date().toDateString();
  return getOrders().filter((o) => new Date(o.createdAt).toDateString() === today);
}

export function getOrdersInRange(days: number): OrderRecord[] {
  const start = new Date();
  start.setDate(start.getDate() - days);
  return getOrders().filter((o) => new Date(o.createdAt) >= start);
}
