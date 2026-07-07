'use client';

import { useState, useEffect } from 'react';
import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Search,
  TrendingDown,
} from 'lucide-react';
import type { InventoryItem } from '@/lib/pos/types';
import { getInventory, saveInventory } from '@/lib/pos/storage';
import { formatPrice } from '@/lib/pos/format';

let idCounter = 200;
function newId() { return `i${++idCounter}`; }

function StockBadge({ item }: { item: InventoryItem }) {
  const isCritical = item.quantity <= item.minLevel * 0.5;
  const isLow = item.quantity <= item.minLevel;
  if (!isLow) {
    return (
      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
        In stock
      </span>
    );
  }
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
      isCritical
        ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    }`}>
      {isCritical ? 'Critical' : 'Low stock'}
    </span>
  );
}

function ItemFormModal({
  item,
  onClose,
  onSave,
}: {
  item?: InventoryItem;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? '',
    category: item?.category ?? 'Supplies',
    quantity: String(item?.quantity ?? ''),
    unit: item?.unit ?? 'pcs',
    minLevel: String(item?.minLevel ?? ''),
    costPerUnit: String(item?.costPerUnit ?? ''),
    supplier: item?.supplier ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: item?.id ?? newId(),
      name: form.name,
      category: form.category,
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      minLevel: parseFloat(form.minLevel) || 0,
      costPerUnit: parseFloat(form.costPerUnit) || 0,
      supplier: form.supplier || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {item ? 'Edit item' : 'Add inventory item'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required className="rounded-lg" placeholder="pcs, liters..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Min level</Label>
              <Input type="number" value={form.minLevel} onChange={(e) => setForm({ ...form, minLevel: e.target.value })} required className="rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cost per unit (₱)</Label>
              <Input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="rounded-lg" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl">
            {item ? 'Save changes' : 'Add item'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setItems(getInventory());
  }, []);

  const persist = (updated: InventoryItem[]) => {
    setItems(updated);
    saveInventory(updated);
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = items.filter((i) => i.quantity <= i.minLevel);
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-700" />
              Inventory
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track stock levels and manage supplies
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add item
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <p className="text-xs text-slate-500 mb-1">Total items</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{items.length}</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Low stock alerts
            </p>
            <p className="text-2xl font-semibold text-amber-700 dark:text-amber-400">{lowStock.length}</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Inventory value
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{formatPrice(totalValue)}</p>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white dark:bg-slate-900"
          />
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Quantity</th>
                  <th className="px-5 py-3 font-medium">Min level</th>
                  <th className="px-5 py-3 font-medium">Cost/unit</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      {item.supplier && <p className="text-[11px] text-slate-400">{item.supplier}</p>}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{item.category}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{item.minLevel}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{formatPrice(item.costPerUnit)}</td>
                    <td className="px-5 py-3"><StockBadge item={item} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditing(item); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => persist(items.filter((i) => i.id !== item.id))}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 py-12">No inventory items found</p>
            )}
          </div>
        </Card>
      </main>

      {showForm && (
        <ItemFormModal
          item={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(item) => {
            if (editing) {
              persist(items.map((i) => (i.id === item.id ? item : i)));
            } else {
              persist([...items, item]);
            }
          }}
        />
      )}
    </div>
  );
}
