'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  Receipt,
  CreditCard,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getOrdersInRange, getTodayOrders } from '@/lib/pos/storage';
import type { OrderRecord, PaymentMethod } from '@/lib/pos/types';
import { formatPrice, formatDateTime } from '@/lib/pos/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function exportCsv(orders: OrderRecord[]) {
  const headers = ['Order #', 'Date', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment'];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt,
    o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
    o.subtotal,
    o.taxAmount,
    o.discountAmount,
    o.total,
    o.paymentMethod,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(getOrdersInRange(range));
  }, [range]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const count = orders.length;
    const avg = count > 0 ? revenue / count : 0;
    const tax = orders.reduce((s, o) => s + o.taxAmount, 0);
    return { revenue, count, avg, tax };
  }, [orders]);

  const todayStats = useMemo(() => {
    const today = getTodayOrders();
    return {
      revenue: today.reduce((s, o) => s + o.total, 0),
      count: today.length,
    };
  }, [orders]);

  const paymentSplit = useMemo(() => {
    const methods: Record<PaymentMethod, number> = { cash: 0, gcash: 0, card: 0 };
    orders.forEach((o) => { methods[o.paymentMethod] += o.total; });
    const total = Object.values(methods).reduce((a, b) => a + b, 0) || 1;
    return {
      cash: Math.round((methods.cash / total) * 100),
      gcash: Math.round((methods.gcash / total) * 100),
      card: Math.round((methods.card / total) * 100),
    };
  }, [orders]);

  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      map.set(day, (map.get(day) ?? 0) + o.total);
    });
    return Array.from(map.entries()).slice(0, 14).reverse();
  }, [orders]);

  const topItems = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = map.get(item.name) ?? { count: 0, revenue: 0 };
        map.set(item.name, {
          count: existing.count + item.qty,
          revenue: existing.revenue + item.price * item.qty,
        });
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const barData = {
    labels: dailyRevenue.map(([d]) => d),
    datasets: [{
      label: 'Revenue',
      data: dailyRevenue.map(([, v]) => v),
      backgroundColor: '#b45309',
      borderRadius: 4,
    }],
  };

  const doughnutData = {
    labels: ['Cash', 'GCash', 'Card'],
    datasets: [{
      data: [paymentSplit.cash, paymentSplit.gcash, paymentSplit.card],
      backgroundColor: ['#b45309', '#d97706', '#fbbf24'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-700" />
              Sales Reports
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Analyze revenue, orders, and payment trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {([7, 30, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    range === d
                      ? 'bg-amber-700 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <Button onClick={() => exportCsv(orders)} variant="outline" className="rounded-xl text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link href="/reports/eod">
              <Button className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                EOD Report
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: <Receipt className="w-3.5 h-3.5" />, label: 'Total revenue', value: formatPrice(stats.revenue), sub: `Today: ${formatPrice(todayStats.revenue)}` },
            { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Orders', value: String(stats.count), sub: `Today: ${todayStats.count}` },
            { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Avg. order', value: formatPrice(stats.avg), sub: `Last ${range} days` },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Tax collected', value: formatPrice(stats.tax), sub: '12% VAT' },
          ].map((m) => (
            <Card key={m.label} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
              <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">{m.icon}{m.label}</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{m.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{m.sub}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Daily revenue</h2>
            <div className="h-48">
              {dailyRevenue.length > 0 ? (
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No sales data yet — complete orders in POS</div>
              )}
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Payment split</h2>
            <div className="h-32">
              {orders.length > 0 ? (
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-3">
              {[
                { label: 'Cash', pct: `${paymentSplit.cash}%`, color: '#b45309' },
                { label: 'GCash', pct: `${paymentSplit.gcash}%`, color: '#d97706' },
                { label: 'Card', pct: `${paymentSplit.card}%`, color: '#fbbf24' },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                  {p.label} {p.pct}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Top items</h2>
            {topItems.length > 0 ? topItems.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(item.revenue)}</p>
                  <p className="text-[11px] text-slate-400">{item.count} sold</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 py-6 text-center">No items sold yet</p>
            )}
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Recent transactions</h2>
            {orders.slice(0, 8).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">#{order.orderNumber}</p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(order.createdAt)} · {order.paymentMethod}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(order.total)}</span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-slate-400 py-6 text-center">No transactions yet</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
