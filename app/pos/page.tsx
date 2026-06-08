'use client';

import { useState, useMemo } from 'react';
import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import {
  Coffee,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
  User,
  Tag,
  Receipt,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'All' | 'Hot Coffee' | 'Iced Coffee' | 'Non-Coffee' | 'Pastries' | 'Sandwiches';
type PaymentMethod = 'cash' | 'gcash' | 'card';
type Size = 'S' | 'M' | 'L';

interface MenuItem {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  basePrice: number;
  emoji: string;
  description: string;
  hasSizes: boolean;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  size?: Size;
  price: number;
  qty: number;
  note?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Latte', category: 'Hot Coffee', basePrice: 120, emoji: '☕', description: 'Espresso with steamed milk', hasSizes: true },
  { id: 'm2', name: 'Cappuccino', category: 'Hot Coffee', basePrice: 115, emoji: '☕', description: 'Bold espresso with foam', hasSizes: true },
  { id: 'm3', name: 'Americano', category: 'Hot Coffee', basePrice: 90, emoji: '☕', description: 'Espresso with hot water', hasSizes: true },
  { id: 'm4', name: 'Flat White', category: 'Hot Coffee', basePrice: 130, emoji: '☕', description: 'Double ristretto with milk', hasSizes: false },
  { id: 'm5', name: 'Espresso', category: 'Hot Coffee', basePrice: 80, emoji: '☕', description: 'Single or double shot', hasSizes: false },
  { id: 'm6', name: 'Cold Brew', category: 'Iced Coffee', basePrice: 150, emoji: '🧊', description: '18-hour steeped cold brew', hasSizes: true },
  { id: 'm7', name: 'Iced Latte', category: 'Iced Coffee', basePrice: 130, emoji: '🧊', description: 'Espresso over ice with milk', hasSizes: true },
  { id: 'm8', name: 'Frappuccino', category: 'Iced Coffee', basePrice: 160, emoji: '🥤', description: 'Blended iced coffee drink', hasSizes: true },
  { id: 'm9', name: 'Iced Americano', category: 'Iced Coffee', basePrice: 100, emoji: '🧊', description: 'Espresso over ice', hasSizes: true },
  { id: 'm10', name: 'Matcha Latte', category: 'Non-Coffee', basePrice: 130, emoji: '🍵', description: 'Ceremonial grade matcha', hasSizes: true },
  { id: 'm11', name: 'Chocolate', category: 'Non-Coffee', basePrice: 110, emoji: '🍫', description: 'Rich hot chocolate', hasSizes: true },
  { id: 'm12', name: 'Chai Latte', category: 'Non-Coffee', basePrice: 125, emoji: '🫖', description: 'Spiced milk tea', hasSizes: true },
  { id: 'm13', name: 'Croissant', category: 'Pastries', basePrice: 75, emoji: '🥐', description: 'Buttery flaky croissant', hasSizes: false },
  { id: 'm14', name: 'Blueberry Muffin', category: 'Pastries', basePrice: 85, emoji: '🧁', description: 'Fresh baked daily', hasSizes: false },
  { id: 'm15', name: 'Cinnamon Roll', category: 'Pastries', basePrice: 95, emoji: '🌀', description: 'Glazed cinnamon roll', hasSizes: false },
  { id: 'm16', name: 'Club Sandwich', category: 'Sandwiches', basePrice: 165, emoji: '🥪', description: 'Triple decker classic', hasSizes: false },
  { id: 'm17', name: 'BLT', category: 'Sandwiches', basePrice: 145, emoji: '🥪', description: 'Bacon lettuce tomato', hasSizes: false },
  { id: 'm18', name: 'Tuna Melt', category: 'Sandwiches', basePrice: 155, emoji: '🥪', description: 'Toasted with melted cheese', hasSizes: false },
];

const CATEGORIES: Category[] = ['All', 'Hot Coffee', 'Iced Coffee', 'Non-Coffee', 'Pastries', 'Sandwiches'];

const SIZE_ADDERS: Record<Size, number> = { S: 0, M: 20, L: 40 };

const DISCOUNTS = [
  { label: 'PWD / Senior (20%)', value: 0.20 },
  { label: 'Student (10%)', value: 0.10 },
  { label: 'Staff (15%)', value: 0.15 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

let cartCounter = 1;
function uid() { return `c${cartCounter++}`; }

function formatPrice(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

// ─── Item Modal ───────────────────────────────────────────────────────────────

function ItemModal({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (cartItem: CartItem) => void;
}) {
  const [size, setSize] = useState<Size>('M');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  const price = item.basePrice + (item.hasSizes ? SIZE_ADDERS[size] : 0);

  const handleAdd = () => {
    onAdd({
      id: uid(),
      menuItemId: item.id,
      name: item.name,
      size: item.hasSizes ? size : undefined,
      price,
      qty,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl mb-1">{item.emoji}</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {item.hasSizes && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Size</p>
            <div className="grid grid-cols-3 gap-2">
              {(['S', 'M', 'L'] as Size[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                    size === s
                      ? 'bg-amber-700 border-amber-700 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                  }`}
                >
                  {s}
                  <span className="block text-[10px] font-normal opacity-70">
                    {s === 'S' ? 'no add' : `+₱${SIZE_ADDERS[s]}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Note</p>
          <input
            type="text"
            placeholder="e.g. less sugar, oat milk…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-lg font-semibold w-5 text-center text-slate-900 dark:text-white">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {formatPrice(price * qty)}
          </span>
        </div>

        <Button
          onClick={handleAdd}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl py-3 font-semibold"
        >
          Add to order
        </Button>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({
  total,
  onClose,
  onComplete,
}: {
  total: number;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [done, setDone] = useState(false);

  const discounted = Math.round(total * (1 - discount));
  const cashGiven = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashGiven - discounted);

  const canPay =
    method !== 'cash' || cashGiven >= discounted;

  const handlePay = () => {
    if (!canPay) return;
    setDone(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-2xl max-w-xs w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Payment received</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {formatPrice(discounted)} via {method === 'cash' ? 'Cash' : method === 'gcash' ? 'GCash' : 'Card'}
          </p>
          {method === 'cash' && change > 0 && (
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              Change: {formatPrice(change)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Customer name */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Customer name (optional)
            </p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="For the cup label…"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Discount
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDiscount(0)}
                className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${
                  discount === 0
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                }`}
              >
                None
              </button>
              {DISCOUNTS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDiscount(d.value)}
                  className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${
                    discount === d.value
                      ? 'bg-amber-700 border-amber-700 text-white font-medium'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
                { key: 'gcash', label: 'GCash', icon: <Smartphone className="w-4 h-4" /> },
                { key: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
              ] as { key: PaymentMethod; label: string; icon: React.ReactNode }[]).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    method === m.key
                      ? 'bg-amber-700 border-amber-700 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cash tendered */}
          {method === 'cash' && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Cash tendered</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₱</span>
                <input
                  type="number"
                  placeholder={String(discounted)}
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[200, 500, 1000].map((q) => (
                  <button
                    key={q}
                    onClick={() => setCashInput(String(q))}
                    className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    ₱{q}
                  </button>
                ))}
                <button
                  onClick={() => setCashInput(String(discounted))}
                  className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Exact
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>Discount ({Math.round(discount * 100)}%)</span>
                <span>-{formatPrice(total - discounted)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2 mt-1">
              <span>Total</span>
              <span>{formatPrice(discounted)}</span>
            </div>
            {method === 'cash' && cashGiven > 0 && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Change</span>
                <span>{formatPrice(change)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button
            onClick={handlePay}
            disabled={!canPay}
            className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-xl py-3 text-base font-semibold"
          >
            {method === 'cash' && cashGiven < discounted && cashGiven > 0
              ? `Short by ${formatPrice(discounted - cashGiven)}`
              : `Charge ${formatPrice(discounted)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── POS Page ─────────────────────────────────────────────────────────────────

export default function POSPage() {
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [orderNum, setOrderNum] = useState(148);

  const filtered = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCat = category === 'All' || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search]);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const addToCart = (cartItem: CartItem) => {
    setCart((prev) => {
      // merge if same item + size + no note
      const existing = prev.find(
        (c) =>
          c.menuItemId === cartItem.menuItemId &&
          c.size === cartItem.size &&
          !cartItem.note &&
          !c.note
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id ? { ...c, qty: c.qty + cartItem.qty } : c
        );
      }
      return [...prev, cartItem];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const clearCart = () => setCart([]);

  const handlePaymentComplete = () => {
    setCart([]);
    setShowPayment(false);
    setOrderNum((n) => n + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <AppNav
        sticky={false}
        containerClassName="max-w-full"
        right={
          <>
            <span className="text-sm text-slate-400 dark:text-slate-500 hidden sm:block">
              Order{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                #{orderNum}
              </span>
            </span>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800"
              >
                <RotateCcw className="w-3 h-3" />
                Clear order
              </button>
            )}
          </>
        }
      />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Menu ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + Category bar */}
          <div className="flex-shrink-0 px-4 pt-4 pb-3 space-y-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                    category === cat
                      ? 'bg-amber-700 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Coffee className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map((item) => {
                  const inCart = cart.filter((c) => c.menuItemId === item.id);
                  const totalQty = inCart.reduce((s, c) => s + c.qty, 0);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="relative group flex flex-col items-start p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all text-left"
                    >
                      {totalQty > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center">
                          {totalQty}
                        </span>
                      )}
                      <span className="text-2xl mb-2">{item.emoji}</span>
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight mb-0.5">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-500">
                        {formatPrice(item.basePrice)}
                        {item.hasSizes && <span className="font-normal text-[10px] text-slate-400"> +</span>}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Cart ── */}
        <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
          {/* Cart header */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                Current order
              </h2>
              {itemCount > 0 && (
                <span className="text-xs text-slate-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-10">
                <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No items yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Tap a menu item to add it</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
                        {item.name}
                        {item.size && (
                          <span className="ml-1 text-[11px] text-slate-400 font-normal">· {item.size}</span>
                        )}
                      </p>
                      {item.note && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 truncate">{item.note}</p>
                      )}
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-slate-500" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center text-slate-900 dark:text-white">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-xl py-3 font-semibold text-base flex items-center justify-center gap-2"
            >
              Charge {cart.length > 0 ? formatPrice(subtotal) : ''}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={addToCart}
        />
      )}
      {showPayment && (
        <PaymentModal
          total={subtotal}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}