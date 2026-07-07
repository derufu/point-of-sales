'use client';

import { useState, useEffect } from 'react';
import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Promo } from '@/lib/pos/types';
import { getPromos, savePromos } from '@/lib/pos/storage';

let idCounter = 300;
function newId() { return `p${++idCounter}`; }

function PromoFormModal({
  promo,
  onClose,
  onSave,
}: {
  promo?: Promo;
  onClose: () => void;
  onSave: (promo: Promo) => void;
}) {
  const [form, setForm] = useState({
    code: promo?.code ?? '',
    description: promo?.description ?? '',
    discountPercent: String(promo?.discountPercent ?? ''),
    minOrder: String(promo?.minOrder ?? ''),
    active: promo?.active ?? true,
    expiresAt: promo?.expiresAt?.split('T')[0] ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: promo?.id ?? newId(),
      code: form.code.toUpperCase(),
      description: form.description,
      discountPercent: parseFloat(form.discountPercent) || 0,
      minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
      active: form.active,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {promo ? 'Edit promo' : 'Create promo'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Promo code</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              placeholder="MORNING10"
              className="rounded-lg uppercase font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Discount %</Label>
              <Input type="number" min="1" max="100" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Min order (₱)</Label>
              <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="rounded-lg" placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expires (optional)</Label>
            <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="rounded-lg" />
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, active: !form.active })}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
          >
            {form.active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
            {form.active ? 'Active' : 'Inactive'}
          </button>
          <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl">
            {promo ? 'Save changes' : 'Create promo'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPromos(getPromos());
  }, []);

  const persist = (updated: Promo[]) => {
    setPromos(updated);
    savePromos(updated);
  };

  const activeCount = promos.filter((p) => p.active).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-700" />
              Promotions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage discount codes for the POS terminal
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New promo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <p className="text-xs text-slate-500 mb-1">Total promos</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{promos.length}</p>
          </Card>
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <p className="text-xs text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          </Card>
        </div>

        <div className="space-y-3">
          {promos.map((promo) => (
            <Card key={promo.id} className={`p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none ${!promo.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-lg">{promo.code}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      promo.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {promo.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{promo.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{promo.discountPercent}% off</span>
                    {promo.minOrder && <span>Min: ₱{promo.minOrder}</span>}
                    {promo.expiresAt && <span>Expires: {new Date(promo.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => persist(promos.map((p) => p.id === promo.id ? { ...p, active: !p.active } : p))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    {promo.active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setEditing(promo); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => persist(promos.filter((p) => p.id !== promo.id))} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {showForm && (
        <PromoFormModal
          promo={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(promo) => {
            if (editing) {
              persist(promos.map((p) => (p.id === promo.id ? promo : p)));
            } else {
              persist([...promos, promo]);
            }
          }}
        />
      )}
    </div>
  );
}
