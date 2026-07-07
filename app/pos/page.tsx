'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Printer,
} from 'lucide-react';
import type { MenuItem, CartItem, PaymentMethod, Size, OrderRecord } from '@/lib/pos/types';
import { TAX_RATE, DISCOUNTS } from '@/lib/pos/types';
import { CATEGORIES, getItemPrice } from '@/lib/pos/menu-data';
import { formatPrice } from '@/lib/pos/format';
import {
  getMenuItems,
  getNextOrderNumber,
  peekOrderNumber,
  saveOrder,
  findPromo,
} from '@/lib/pos/storage';
import { printReceipt } from '@/lib/pos/receipt';
import { createClient } from '@/lib/supabase/client';
import { createOrder, recordOrder } from '@/lib/services/profile';

type PosCategory = 'All' | (typeof CATEGORIES)[number];

let cartCounter = 1;
function uid() { return `c${cartCounter++}`; }

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
  const price = getItemPrice(item, item.hasSizes ? size : undefined);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
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
                    {formatPrice(getItemPrice(item, s))}
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
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-lg font-semibold w-5 text-center text-slate-900 dark:text-white">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(price * qty)}</span>
        </div>

        <Button onClick={handleAdd} className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl py-3 font-semibold">
          Add to order
        </Button>
      </div>
    </div>
  );
}

interface PaymentResult {
  method: PaymentMethod;
  discountPercent: number;
  promoCode?: string;
  customerName?: string;
  cashGiven?: number;
  change?: number;
}

function PaymentModal({
  subtotal,
  onClose,
  onComplete,
}: {
  subtotal: number;
  onClose: () => void;
  onComplete: (result: PaymentResult) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [done, setDone] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const discountAmount = Math.round(subtotal * discount);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * TAX_RATE);
  const total = afterDiscount + taxAmount;
  const cashGiven = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashGiven - total);
  const canPay = method !== 'cash' || cashGiven >= total;

  const applyPromo = () => {
    const promo = findPromo(promoCode);
    if (!promo) {
      setPromoError('Invalid or expired promo code');
      return;
    }
    if (promo.minOrder && subtotal < promo.minOrder) {
      setPromoError(`Minimum order: ${formatPrice(promo.minOrder)}`);
      return;
    }
    setDiscount(promo.discountPercent / 100);
    setPromoError('');
  };

  const handlePay = () => {
    if (!canPay) return;
    const result: PaymentResult = {
      method,
      discountPercent: discount,
      promoCode: promoCode || undefined,
      customerName: customerName || undefined,
      cashGiven: method === 'cash' ? cashGiven : undefined,
      change: method === 'cash' ? change : undefined,
    };
    setPaymentResult(result);
    setDone(true);
    setTimeout(() => onComplete(result), 1800);
  };

  if (done && paymentResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-2xl max-w-xs w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Payment received</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {formatPrice(total)} via {method === 'cash' ? 'Cash' : method === 'gcash' ? 'GCash' : 'Card'}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Customer name (optional)</p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="For the cup label…" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Promo code
            </p>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter code" value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <Button onClick={applyPromo} variant="outline" className="rounded-xl shrink-0">Apply</Button>
            </div>
            {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Discount</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setDiscount(0)} className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${discount === 0 ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>None</button>
              {DISCOUNTS.map((d) => (
                <button key={d.label} onClick={() => setDiscount(d.value)} className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${discount === d.value ? 'bg-amber-700 border-amber-700 text-white font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-300'}`}>{d.label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'cash' as const, label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
                { key: 'gcash' as const, label: 'GCash', icon: <Smartphone className="w-4 h-4" /> },
                { key: 'card' as const, label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
              ]).map((m) => (
                <button key={m.key} onClick={() => setMethod(m.key)} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-colors ${method === m.key ? 'bg-amber-700 border-amber-700 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'}`}>
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
          </div>

          {method === 'cash' && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Cash tendered</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₱</span>
                <input type="number" placeholder={String(total)} value={cashInput} onChange={(e) => setCashInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[200, 500, 1000].map((q) => (
                  <button key={q} onClick={() => setCashInput(String(q))} className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">₱{q}</button>
                ))}
                <button onClick={() => setCashInput(String(total))} className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">Exact</button>
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount ({Math.round(discount * 100)}%)</span><span>-{formatPrice(discountAmount)}</span></div>}
            <div className="flex justify-between text-sm text-slate-500"><span>VAT (12%)</span><span>{formatPrice(taxAmount)}</span></div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2 mt-1"><span>Total</span><span>{formatPrice(total)}</span></div>
            {method === 'cash' && cashGiven > 0 && <div className="flex justify-between text-sm font-semibold text-emerald-600"><span>Change</span><span>{formatPrice(change)}</span></div>}
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button onClick={handlePay} disabled={!canPay} className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-xl py-3 text-base font-semibold">
            {method === 'cash' && cashGiven < total && cashGiven > 0 ? `Short by ${formatPrice(total - cashGiven)}` : `Charge ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const [category, setCategory] = useState<PosCategory>('All');
  const [search, setSearch] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [orderNum, setOrderNum] = useState('0149');
  const [storeName, setStoreName] = useState('CaféPOS');
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    setMenuItems(getMenuItems().filter((i) => i.available));
    setOrderNum(peekOrderNumber());
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.store_name) {
        setStoreName(user.user_metadata.store_name);
        localStorage.setItem('cafepos_store_name', user.user_metadata.store_name);
      }
    });
  }, []);

  const allCategories: PosCategory[] = ['All', ...CATEGORIES];
  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = category === 'All' || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, category, search]);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxPreview = Math.round(subtotal * TAX_RATE);
  const totalPreview = subtotal + taxPreview;
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const addToCart = (cartItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === cartItem.menuItemId && c.size === cartItem.size && !cartItem.note && !c.note);
      if (existing) return prev.map((c) => c.id === existing.id ? { ...c, qty: c.qty + cartItem.qty } : c);
      return [...prev, cartItem];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0));
  };

  const handlePaymentComplete = async (result: PaymentResult) => {
    const orderNumber = getNextOrderNumber();
    const discountAmount = Math.round(subtotal * result.discountPercent);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round(afterDiscount * TAX_RATE);
    const total = afterDiscount + taxAmount;

    const order: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: [...cart],
      subtotal,
      taxAmount,
      discountAmount,
      discountPercent: result.discountPercent,
      total,
      paymentMethod: result.method,
      customerName: result.customerName,
      promoCode: result.promoCode,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);
    setLastOrder(order);
    printReceipt(order, storeName);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      createOrder(user.id, {
        order_number: orderNumber,
        total_amount: total,
        tax_amount: taxAmount,
        payment_method: result.method,
        status: 'completed',
        notes: result.customerName ?? null,
      }).catch(() => {});
      recordOrder(user.id, total, itemCount).catch(() => {});
    }

    setCart([]);
    setShowPayment(false);
    setOrderNum(peekOrderNumber());
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <AppNav
        sticky={false}
        containerClassName="max-w-full"
        right={
          <>
            <span className="text-sm text-slate-400 dark:text-slate-500 hidden sm:block">
              Order <span className="font-semibold text-slate-700 dark:text-slate-300">#{orderNum}</span>
            </span>
            {lastOrder && (
              <button onClick={() => printReceipt(lastOrder, storeName)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-600 px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                <Printer className="w-3 h-3" /> Reprint
              </button>
            )}
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-4 pt-4 pb-3 space-y-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search menu…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${category === cat ? 'bg-amber-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}>{cat}</button>
              ))}
            </div>
          </div>

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
                    <button key={item.id} onClick={() => setSelectedItem(item)} className="relative group flex flex-col items-start p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all text-left">
                      {totalQty > 0 && <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center">{totalQty}</span>}
                      <span className="text-2xl mb-2">{item.emoji}</span>
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight mb-0.5">{item.name}</p>
                      <p className="text-[11px] text-slate-400 leading-tight mb-2 line-clamp-2">{item.description}</p>
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-500">{formatPrice(item.basePrice)}{item.hasSizes && <span className="font-normal text-[10px] text-slate-400"> +</span>}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
          <div className="flex-shrink-0 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-400" /> Current order
              {itemCount > 0 && <span className="text-xs text-slate-400 font-normal ml-auto">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>}
            </h2>
          </div>

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
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
                        {item.name}{item.size && <span className="ml-1 text-[11px] text-slate-400 font-normal">· {item.size}</span>}
                      </p>
                      {item.note && <p className="text-[11px] text-amber-600 dark:text-amber-400 truncate">{item.note}</p>}
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{formatPrice(item.price * item.qty)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center"><Minus className="w-3 h-3 text-slate-500" /></button>
                      <span className="text-sm font-semibold w-4 text-center text-slate-900 dark:text-white">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center"><Plus className="w-3 h-3 text-slate-500" /></button>
                      <button onClick={() => setCart((prev) => prev.filter((c) => c.id !== item.id))} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>VAT (12%)</span><span>{formatPrice(taxPreview)}</span></div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white"><span>Total</span><span>{formatPrice(totalPreview)}</span></div>
            </div>
            <Button onClick={() => setShowPayment(true)} disabled={cart.length === 0} className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-xl py-3 font-semibold text-base flex items-center justify-center gap-2">
              Charge {cart.length > 0 ? formatPrice(totalPreview) : ''}<ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} />}
      {showPayment && <PaymentModal subtotal={subtotal} onClose={() => setShowPayment(false)} onComplete={handlePaymentComplete} />}
    </div>
  );
}
