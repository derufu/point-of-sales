import type { Category, MenuItem } from './types';

export const CATEGORIES: Category[] = [
  'Hot Coffee',
  'Iced Coffee',
  'Non-Coffee',
  'Pastries',
  'Sandwiches',
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Latte', category: 'Hot Coffee', basePrice: 120, sizeM: 140, sizeL: 160, hasSizes: true, emoji: '☕', description: 'Espresso with steamed milk', available: true, cost: 45 },
  { id: 'm2', name: 'Cappuccino', category: 'Hot Coffee', basePrice: 115, sizeM: 135, sizeL: 155, hasSizes: true, emoji: '☕', description: 'Bold espresso with foam', available: true, cost: 40 },
  { id: 'm3', name: 'Americano', category: 'Hot Coffee', basePrice: 90, sizeM: 110, sizeL: 130, hasSizes: true, emoji: '☕', description: 'Espresso with hot water', available: true, cost: 28 },
  { id: 'm4', name: 'Flat White', category: 'Hot Coffee', basePrice: 130, sizeM: 130, sizeL: 130, hasSizes: false, emoji: '☕', description: 'Double ristretto with milk', available: true, cost: 48 },
  { id: 'm5', name: 'Espresso', category: 'Hot Coffee', basePrice: 80, sizeM: 80, sizeL: 80, hasSizes: false, emoji: '☕', description: 'Single or double shot', available: true, cost: 25 },
  { id: 'm6', name: 'Cold Brew', category: 'Iced Coffee', basePrice: 150, sizeM: 170, sizeL: 190, hasSizes: true, emoji: '🧊', description: '18-hour steeped cold brew', available: true, cost: 55 },
  { id: 'm7', name: 'Iced Latte', category: 'Iced Coffee', basePrice: 130, sizeM: 150, sizeL: 170, hasSizes: true, emoji: '🧊', description: 'Espresso over ice with milk', available: true, cost: 48 },
  { id: 'm8', name: 'Frappuccino', category: 'Iced Coffee', basePrice: 160, sizeM: 180, sizeL: 200, hasSizes: true, emoji: '🥤', description: 'Blended iced coffee drink', available: false, cost: 65 },
  { id: 'm9', name: 'Iced Americano', category: 'Iced Coffee', basePrice: 100, sizeM: 120, sizeL: 140, hasSizes: true, emoji: '🧊', description: 'Espresso over ice', available: true, cost: 32 },
  { id: 'm10', name: 'Matcha Latte', category: 'Non-Coffee', basePrice: 130, sizeM: 150, sizeL: 170, hasSizes: true, emoji: '🍵', description: 'Ceremonial grade matcha', available: true, cost: 52 },
  { id: 'm11', name: 'Chocolate', category: 'Non-Coffee', basePrice: 110, sizeM: 130, sizeL: 150, hasSizes: true, emoji: '🍫', description: 'Rich hot chocolate', available: true, cost: 38 },
  { id: 'm12', name: 'Chai Latte', category: 'Non-Coffee', basePrice: 125, sizeM: 145, sizeL: 165, hasSizes: true, emoji: '🫖', description: 'Spiced milk tea', available: false, cost: 42 },
  { id: 'm13', name: 'Croissant', category: 'Pastries', basePrice: 75, sizeM: 75, sizeL: 75, hasSizes: false, emoji: '🥐', description: 'Buttery flaky croissant', available: true, cost: 28 },
  { id: 'm14', name: 'Blueberry Muffin', category: 'Pastries', basePrice: 85, sizeM: 85, sizeL: 85, hasSizes: false, emoji: '🧁', description: 'Fresh baked daily', available: true, cost: 32 },
  { id: 'm15', name: 'Cinnamon Roll', category: 'Pastries', basePrice: 95, sizeM: 95, sizeL: 95, hasSizes: false, emoji: '🌀', description: 'Glazed cinnamon roll', available: true, cost: 35 },
  { id: 'm16', name: 'Club Sandwich', category: 'Sandwiches', basePrice: 165, sizeM: 165, sizeL: 165, hasSizes: false, emoji: '🥪', description: 'Triple decker classic', available: true, cost: 70 },
  { id: 'm17', name: 'BLT', category: 'Sandwiches', basePrice: 145, sizeM: 145, sizeL: 145, hasSizes: false, emoji: '🥪', description: 'Bacon lettuce tomato', available: true, cost: 58 },
  { id: 'm18', name: 'Tuna Melt', category: 'Sandwiches', basePrice: 155, sizeM: 155, sizeL: 155, hasSizes: false, emoji: '🥪', description: 'Toasted with melted cheese', available: true, cost: 62 },
];

export function getItemPrice(item: MenuItem, size?: 'S' | 'M' | 'L'): number {
  if (!item.hasSizes || !size) return item.basePrice;
  if (size === 'M') return item.sizeM;
  if (size === 'L') return item.sizeL;
  return item.basePrice;
}
