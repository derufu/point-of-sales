'use client';

import { useState, useMemo, useEffect } from 'react';
import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Coffee,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  GripVertical,
  ImagePlus,
} from 'lucide-react';
import { getMenuItems, saveMenuItems } from '@/lib/pos/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Hot Coffee' | 'Iced Coffee' | 'Non-Coffee' | 'Pastries' | 'Sandwiches';

interface MenuItem {
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
  cost: number; // estimated cost for margin calc
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_ITEMS: MenuItem[] = [
  { id: 'm1',  name: 'Latte',          category: 'Hot Coffee',  basePrice: 120, sizeM: 140, sizeL: 160, hasSizes: true,  emoji: '☕', description: 'Espresso with steamed milk',       available: true,  cost: 45 },
  { id: 'm2',  name: 'Cappuccino',     category: 'Hot Coffee',  basePrice: 115, sizeM: 135, sizeL: 155, hasSizes: true,  emoji: '☕', description: 'Bold espresso with foam',           available: true,  cost: 40 },
  { id: 'm3',  name: 'Americano',      category: 'Hot Coffee',  basePrice: 90,  sizeM: 110, sizeL: 130, hasSizes: true,  emoji: '☕', description: 'Espresso with hot water',           available: true,  cost: 28 },
  { id: 'm4',  name: 'Flat White',     category: 'Hot Coffee',  basePrice: 130, sizeM: 130, sizeL: 130, hasSizes: false, emoji: '☕', description: 'Double ristretto with milk',        available: true,  cost: 48 },
  { id: 'm5',  name: 'Espresso',       category: 'Hot Coffee',  basePrice: 80,  sizeM: 80,  sizeL: 80,  hasSizes: false, emoji: '☕', description: 'Single or double shot',             available: true,  cost: 25 },
  { id: 'm6',  name: 'Cold Brew',      category: 'Iced Coffee', basePrice: 150, sizeM: 170, sizeL: 190, hasSizes: true,  emoji: '🧊', description: '18-hour steeped cold brew',         available: true,  cost: 55 },
  { id: 'm7',  name: 'Iced Latte',     category: 'Iced Coffee', basePrice: 130, sizeM: 150, sizeL: 170, hasSizes: true,  emoji: '🧊', description: 'Espresso over ice with milk',       available: true,  cost: 48 },
  { id: 'm8',  name: 'Frappuccino',    category: 'Iced Coffee', basePrice: 160, sizeM: 180, sizeL: 200, hasSizes: true,  emoji: '🥤', description: 'Blended iced coffee drink',         available: false, cost: 65 },
  { id: 'm9',  name: 'Iced Americano', category: 'Iced Coffee', basePrice: 100, sizeM: 120, sizeL: 140, hasSizes: true,  emoji: '🧊', description: 'Espresso over ice',                 available: true,  cost: 32 },
  { id: 'm10', name: 'Matcha Latte',   category: 'Non-Coffee',  basePrice: 130, sizeM: 150, sizeL: 170, hasSizes: true,  emoji: '🍵', description: 'Ceremonial grade matcha',           available: true,  cost: 52 },
  { id: 'm11', name: 'Chocolate',      category: 'Non-Coffee',  basePrice: 110, sizeM: 130, sizeL: 150, hasSizes: true,  emoji: '🍫', description: 'Rich hot chocolate',                available: true,  cost: 38 },
  { id: 'm12', name: 'Chai Latte',     category: 'Non-Coffee',  basePrice: 125, sizeM: 145, sizeL: 165, hasSizes: true,  emoji: '🫖', description: 'Spiced milk tea',                   available: false, cost: 42 },
  { id: 'm13', name: 'Croissant',      category: 'Pastries',    basePrice: 75,  sizeM: 75,  sizeL: 75,  hasSizes: false, emoji: '🥐', description: 'Buttery flaky croissant',           available: true,  cost: 28 },
  { id: 'm14', name: 'Blueberry Muffin',category:'Pastries',    basePrice: 85,  sizeM: 85,  sizeL: 85,  hasSizes: false, emoji: '🧁', description: 'Fresh baked daily',                 available: true,  cost: 32 },
  { id: 'm15', name: 'Cinnamon Roll',  category: 'Pastries',    basePrice: 95,  sizeM: 95,  sizeL: 95,  hasSizes: false, emoji: '🌀', description: 'Glazed cinnamon roll',              available: true,  cost: 35 },
  { id: 'm16', name: 'Club Sandwich',  category: 'Sandwiches',  basePrice: 165, sizeM: 165, sizeL: 165, hasSizes: false, emoji: '🥪', description: 'Triple decker classic',             available: true,  cost: 70 },
  { id: 'm17', name: 'BLT',            category: 'Sandwiches',  basePrice: 145, sizeM: 145, sizeL: 145, hasSizes: false, emoji: '🥪', description: 'Bacon lettuce tomato',              available: true,  cost: 58 },
  { id: 'm18', name: 'Tuna Melt',      category: 'Sandwiches',  basePrice: 155, sizeM: 155, sizeL: 155, hasSizes: false, emoji: '🥪', description: 'Toasted with melted cheese',        available: true,  cost: 62 },
];

const CATEGORIES: Category[] = ['Hot Coffee', 'Iced Coffee', 'Non-Coffee', 'Pastries', 'Sandwiches'];

const CATEGORY_EMOJI: Record<Category, string> = {
  'Hot Coffee': '☕',
  'Iced Coffee': '🧊',
  'Non-Coffee': '🍵',
  'Pastries': '🥐',
  'Sandwiches': '🥪',
};

const EMOJIS = ['☕','🧊','🥤','🍵','🍫','🫖','🥐','🧁','🌀','🥪','🍰','🫙','🧋','🍦','🥗'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 100;
function newId() { return `m${++idCounter}`; }
function fp(n: number) { return '₱' + n.toLocaleString('en-PH'); }
function margin(price: number, cost: number) {
  return Math.round(((price - cost) / price) * 100);
}

const EMPTY_FORM = {
  name: '',
  category: 'Hot Coffee' as Category,
  basePrice: '',
  sizeM: '',
  sizeL: '',
  hasSizes: true,
  emoji: '☕',
  description: '',
  available: true,
  cost: '',
};

// ─── Item Form Modal ──────────────────────────────────────────────────────────

function ItemFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: MenuItem;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          basePrice: String(initial.basePrice),
          sizeM: String(initial.sizeM),
          sizeL: String(initial.sizeL),
          hasSizes: initial.hasSizes,
          emoji: initial.emoji,
          description: initial.description,
          available: initial.available,
          cost: String(initial.cost),
        }
      : EMPTY_FORM
  );
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.basePrice || isNaN(Number(form.basePrice))) e.basePrice = 'Enter a valid price';
    if (!form.cost || isNaN(Number(form.cost))) e.cost = 'Enter a valid cost';
    if (form.hasSizes) {
      if (!form.sizeM || isNaN(Number(form.sizeM))) e.sizeM = 'Enter medium price';
      if (!form.sizeL || isNaN(Number(form.sizeL))) e.sizeL = 'Enter large price';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? newId(),
      name: form.name.trim(),
      category: form.category,
      basePrice: Number(form.basePrice),
      sizeM: form.hasSizes ? Number(form.sizeM) : Number(form.basePrice),
      sizeL: form.hasSizes ? Number(form.sizeL) : Number(form.basePrice),
      hasSizes: form.hasSizes,
      emoji: form.emoji,
      description: form.description.trim(),
      available: form.available,
      cost: Number(form.cost),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {initial ? 'Edit item' : 'Add new item'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Emoji + Name */}
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setEmojiOpen((v) => !v)}
                className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl hover:border-amber-400 transition-colors flex-shrink-0"
              >
                {form.emoji}
              </button>
              {emojiOpen && (
                <div className="absolute top-16 left-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 grid grid-cols-5 gap-1 shadow-lg">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => { set('emoji', e); setEmojiOpen(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-lg"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Item name *
              </label>
              <input
                type="text"
                placeholder="e.g. Caramel Macchiato"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="Short description shown on POS…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full appearance-none px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-8"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Sizes toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Has size options</p>
              <p className="text-xs text-slate-400">Small / Medium / Large pricing</p>
            </div>
            <button
              onClick={() => set('hasSizes', !form.hasSizes)}
              className={`transition-colors ${form.hasSizes ? 'text-amber-700' : 'text-slate-300 dark:text-slate-600'}`}
            >
              {form.hasSizes
                ? <ToggleRight className="w-8 h-8" />
                : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              {form.hasSizes ? 'Prices (Small / Medium / Large)' : 'Price'}
            </label>
            {form.hasSizes ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'basePrice', label: 'S' },
                  { key: 'sizeM', label: 'M' },
                  { key: 'sizeL', label: 'L' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{label} ₱</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={form[key as keyof typeof form] as string}
                        onChange={(e) => set(key, e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors[key] ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                      />
                    </div>
                    {errors[key] && <p className="text-[10px] text-red-500 mt-0.5">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₱</span>
                <input
                  type="number"
                  placeholder="0"
                  value={form.basePrice}
                  onChange={(e) => set('basePrice', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.basePrice ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                />
              </div>
            )}
            {errors.basePrice && !form.hasSizes && (
              <p className="text-[11px] text-red-500 mt-1">{errors.basePrice}</p>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Estimated cost (for margin)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₱</span>
              <input
                type="number"
                placeholder="0"
                value={form.cost}
                onChange={(e) => set('cost', e.target.value)}
                className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.cost ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
              />
            </div>
            {form.cost && form.basePrice && !isNaN(Number(form.cost)) && !isNaN(Number(form.basePrice)) && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                Margin: {margin(Number(form.basePrice), Number(form.cost))}%
              </p>
            )}
            {errors.cost && <p className="text-[11px] text-red-500 mt-1">{errors.cost}</p>}
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Available</p>
              <p className="text-xs text-slate-400">Visible and orderable in POS</p>
            </div>
            <button
              onClick={() => set('available', !form.available)}
              className={`transition-colors ${form.available ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'}`}
            >
              {form.available
                ? <ToggleRight className="w-8 h-8" />
                : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl border-slate-200 dark:border-slate-700">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-amber-700 hover:bg-amber-800 text-white rounded-xl">
            {initial ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  item,
  onConfirm,
  onClose,
}: {
  item: MenuItem;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Delete item?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">This cannot be undone.</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <span className="text-xl">{item.emoji}</span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs text-slate-400">{item.category} · {fp(item.basePrice)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl border-slate-200 dark:border-slate-700">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Menu Page ────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    setItems(getMenuItems());
  }, []);

  const persist = (updated: MenuItem[]) => {
    setItems(updated);
    saveMenuItems(updated);
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  // Group by category for grid view
  const grouped = useMemo(() => {
    const cats = activeCategory === 'All' ? CATEGORIES : [activeCategory as Category];
    return cats
      .map((cat) => ({
        cat,
        items: filtered.filter((i) => i.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered, activeCategory]);

  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.available).length;
    const unavailable = total - available;
    const avgMargin = Math.round(
      items.reduce((s, i) => s + margin(i.basePrice, i.cost), 0) / total
    );
    return { total, available, unavailable, avgMargin };
  }, [items]);

  const handleSave = (item: MenuItem) => {
    persist(
      items.find((i) => i.id === item.id)
        ? items.map((i) => (i.id === item.id ? item : i))
        : [...items, item]
    );
  };

  const handleDelete = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    setDeleteItem(null);
  };

  const toggleAvailable = (id: string) => {
    persist(items.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  };

  const m = (item: MenuItem) => margin(item.basePrice, item.cost);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppNav
        right={
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add item</span>
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total items', value: stats.total, sub: 'across all categories' },
            { label: 'Available', value: stats.available, sub: 'visible in POS', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Unavailable', value: stats.unavailable, sub: 'hidden from POS', color: 'text-red-500 dark:text-red-400' },
            { label: 'Avg. margin', value: `${stats.avgMargin}%`, sub: 'across all items', color: 'text-amber-700 dark:text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color ?? 'text-slate-900 dark:text-white'}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {(['All', ...CATEGORIES] as (Category | 'All')[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 text-[12px] font-medium px-3 py-2 rounded-xl transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-700 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-300'
                }`}
              >
                {cat !== 'All' && CATEGORY_EMOJI[cat as Category]}{' '}
                {cat}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1 flex-shrink-0">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'table' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Table
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Coffee className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No items found</p>
            <p className="text-xs mt-1">Try a different search or category</p>
          </div>
        ) : view === 'grid' ? (
          /* ── Grid View ── */
          <div className="space-y-8">
            {grouped.map(({ cat, items: catItems }) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CATEGORY_EMOJI[cat]}</span>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{cat}</h2>
                  <span className="text-xs text-slate-400">({catItems.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {catItems.map((item) => (
                    <Card
                      key={item.id}
                      className={`relative p-4 rounded-2xl border shadow-none transition-all group ${
                        item.available
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 opacity-60'
                      }`}
                    >
                      {/* Availability dot */}
                      <span
                        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                          item.available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />

                      <div className="text-2xl mb-2">{item.emoji}</div>
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight mb-0.5">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-amber-700 dark:text-amber-500">
                            {fp(item.basePrice)}
                          </p>
                          {item.hasSizes && (
                            <p className="text-[10px] text-slate-400">
                              M {fp(item.sizeM)} · L {fp(item.sizeL)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                            m(item) >= 60
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              : m(item) >= 40
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {m(item)}%
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toggleAvailable(item.id)}
                          title={item.available ? 'Mark unavailable' : 'Mark available'}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                            item.available
                              ? 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700'
                          }`}
                        >
                          {item.available ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => setEditItem(item)}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-700 hover:border-amber-300 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Table View ── */
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-none overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide w-8"></th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Price (S)</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">M</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">L</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Margin</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!item.available ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-slate-300 dark:text-slate-600">
                        <GripVertical className="w-4 h-4" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-[13px]">{item.name}</p>
                            <p className="text-[11px] text-slate-400 hidden sm:block">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-700 dark:text-amber-500 text-[13px]">
                        {fp(item.basePrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-[13px] hidden md:table-cell">
                        {item.hasSizes ? fp(item.sizeM) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-[13px] hidden md:table-cell">
                        {item.hasSizes ? fp(item.sizeL) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                            m(item) >= 60
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              : m(item) >= 40
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {m(item)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleAvailable(item.id)}>
                          {item.available
                            ? <ToggleRight className="w-6 h-6 text-emerald-500 mx-auto" />
                            : <ToggleLeft className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* ── Modals ── */}
      {showAdd && (
        <ItemFormModal
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editItem && (
        <ItemFormModal
          initial={editItem}
          onSave={handleSave}
          onClose={() => setEditItem(null)}
        />
      )}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onConfirm={() => handleDelete(deleteItem.id)}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}