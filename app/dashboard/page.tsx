'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Coffee,
  BarChart3,
  ShoppingCart,
  Bell,
  Clock,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Package,
  Tag,
  Printer,
  PlusCircle,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { getTodayOrders, getOrdersInRange, getInventory } from '@/lib/pos/storage';
import { formatPrice, formatDateTime } from '@/lib/pos/format';
import type { OrderRecord, PaymentMethod } from '@/lib/pos/types';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'ready' | 'making' | 'queued';

interface Order {
  num: string;
  items: string;
  status: OrderStatus;
  amount: string;
  time: string;
}

interface TopItem {
  name: string;
  sub: string;
  count: number;
  rev: string;
  pct: number;
}

interface StaffMember {
  name: string;
  initials: string;
  orders: number;
  amt: string;
}

interface StockItem {
  name: string;
  level: number;
  unit: string;
  severity: 'danger' | 'warning';
}

// ─── Static fallbacks (used when no live data) ────────────────────────────────

const HOURS = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white leading-none">{value}</p>
      <p
        className={`text-[11px] mt-1 flex items-center gap-0.5 ${
          trend === 'up'
            ? 'text-emerald-600 dark:text-emerald-400'
            : trend === 'down'
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-400'
        }`}
      >
        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
        {sub}
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  making: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  queued: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};
const STATUS_LABEL: Record<OrderStatus, string> = {
  ready: 'Ready',
  making: 'In progress',
  queued: 'Queued',
};

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white">{order.num}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {order.items} · {order.time}
        </p>
      </div>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{order.amount}</span>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [showYesterday, setShowYesterday] = useState(false);
  const [now, setNow] = useState(new Date());
  const [todayOrders, setTodayOrders] = useState<OrderRecord[]>([]);
  const [yesterdayOrders, setYesterdayOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    setTodayOrders(getTodayOrders());
    const all = getOrdersInRange(2);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toDateString();
    setYesterdayOrders(all.filter((o) => new Date(o.createdAt).toDateString() === yStr));
  }, []);

  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + o.total, 0);
  const revenueChange = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : '0';
  const avgOrder = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  const orders: Order[] = todayOrders.slice(0, 8).map((o) => ({
    num: `#${o.orderNumber}`,
    items: o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', '),
    status: 'ready' as OrderStatus,
    amount: formatPrice(o.total),
    time: formatDateTime(o.createdAt).split(', ').pop() ?? '',
  }));

  const topItems: TopItem[] = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    todayOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = map.get(item.name) ?? { count: 0, revenue: 0 };
        map.set(item.name, { count: existing.count + item.qty, revenue: existing.revenue + item.price * item.qty });
      });
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
    const maxRev = sorted[0]?.[1].revenue ?? 1;
    return sorted.map(([name, data]) => ({
      name,
      sub: `${data.count} sold today`,
      count: data.count,
      rev: formatPrice(data.revenue),
      pct: Math.round((data.revenue / maxRev) * 100),
    }));
  }, [todayOrders]);

  const stockItems: StockItem[] = useMemo(() => {
    return getInventory()
      .filter((i) => i.quantity <= i.minLevel)
      .slice(0, 5)
      .map((i) => ({
        name: i.name,
        level: i.quantity,
        unit: i.unit,
        severity: i.quantity <= i.minLevel * 0.5 ? 'danger' as const : 'warning' as const,
      }));
  }, []);

  const hourlyToday = useMemo(() => {
    const data = new Array(13).fill(0);
    todayOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      if (hour >= 6 && hour <= 18) data[hour - 6] += o.total;
    });
    return data;
  }, [todayOrders]);

  const hourlyYesterday = useMemo(() => {
    const data = new Array(13).fill(0);
    yesterdayOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      if (hour >= 6 && hour <= 18) data[hour - 6] += o.total;
    });
    return data;
  }, [yesterdayOrders]);

  const paymentSplit = useMemo(() => {
    const methods: Record<PaymentMethod, number> = { cash: 0, gcash: 0, card: 0 };
    todayOrders.forEach((o) => { methods[o.paymentMethod] += o.total; });
    const total = Object.values(methods).reduce((a, b) => a + b, 0) || 1;
    return {
      cash: Math.round((methods.cash / total) * 100),
      gcash: Math.round((methods.gcash / total) * 100),
      card: Math.round((methods.card / total) * 100),
    };
  }, [todayOrders]);

  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter);

  const timeString = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  // Chart data
  const revenueChartData = {
    labels: HOURS.map((h) => `${h}:00`),
    datasets: [
      {
        label: 'Today',
        data: hourlyToday,
        backgroundColor: '#b45309',
        borderRadius: 4,
        borderSkipped: false as const,
      },
      ...(showYesterday
        ? [
            {
              label: 'Yesterday',
              data: hourlyYesterday,
              backgroundColor: 'rgba(180,83,9,0.25)',
              borderRadius: 4,
              borderSkipped: false as const,
            },
          ]
        : []),
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => '₱' + ctx.parsed.y.toLocaleString(),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#888' },
      },
      y: {
        grid: { color: 'rgba(128,128,128,0.1)' },
        ticks: {
          font: { size: 10 },
          color: '#888',
          callback: (v: number | string) => '₱' + (Number(v) / 1000).toFixed(1) + 'k',
        },
        beginAtZero: true,
      },
    },
  };

  const paymentChartData = {
    labels: [`Cash ${paymentSplit.cash}%`, `GCash ${paymentSplit.gcash}%`, `Card ${paymentSplit.card}%`],
    datasets: [
      {
        data: [paymentSplit.cash, paymentSplit.gcash, paymentSplit.card],
        backgroundColor: ['#b45309', '#d97706', '#fbbf24'],
        borderWidth: 0,
      },
    ],
  };

  const paymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { label: string }) => ctx.label } },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <AppNav
        right={
          <>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              {dateString} · {timeString}
            </span>
            <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={<Receipt className="w-3.5 h-3.5" />}
            label="Today's revenue"
            value={formatPrice(todayRevenue)}
            sub={`${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}% vs yesterday`}
            trend={Number(revenueChange) >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            icon={<ShoppingCart className="w-3.5 h-3.5" />}
            label="Orders"
            value={String(todayOrders.length)}
            sub={`${yesterdayOrders.length} yesterday`}
            trend={todayOrders.length >= yesterdayOrders.length ? 'up' : 'down'}
          />
          <MetricCard
            icon={<CreditCard className="w-3.5 h-3.5" />}
            label="Avg. order value"
            value={formatPrice(avgOrder)}
            sub="Today"
            trend="neutral"
          />
          <MetricCard
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Avg. prep time"
            value="3.2 min"
            sub="Faster by 0.4 min"
            trend="up"
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: chart + orders (2/3 width) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Revenue Chart */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Hourly revenue — today
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-700 inline-block" />
                    Today
                  </div>
                  {showYesterday && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-700/30 border border-dashed border-amber-700 inline-block" />
                      Yesterday
                    </div>
                  )}
                  <button
                    onClick={() => setShowYesterday((v) => !v)}
                    className="text-[11px] text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showYesterday ? 'Hide' : 'Compare yesterday'}
                  </button>
                </div>
              </div>
              <div className="relative h-48">
                <Bar data={revenueChartData} options={revenueChartOptions as never} />
              </div>
            </Card>

            {/* Orders */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent orders</h2>
                <div className="flex gap-1">
                  {(['all', 'ready', 'making', 'queued'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors capitalize ${
                        orderFilter === f
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {f === 'making' ? 'In progress' : f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y-0">
                {filteredOrders.map((order) => (
                  <OrderRow key={order.num} order={order} />
                ))}
                {filteredOrders.length === 0 && (
                  <p className="text-sm text-slate-400 py-6 text-center">No orders in this category</p>
                )}
              </div>
              <Link href="/pos">
                <Button className="w-full mt-4 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium">
                  Open POS
                </Button>
              </Link>
            </Card>
          </div>

          {/* Right: sidebar (1/3 width) */}
          <div className="space-y-5">
            {/* Top Items */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Top items today</h2>
              <div className="space-y-3">
                {topItems.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="min-w-[90px]">
                      <p className="text-[13px] font-medium text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.sub} · {item.count} sold
                      </p>
                    </div>
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-700 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-900 dark:text-white min-w-[48px] text-right">
                      {item.rev}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick actions</h2>
              <div className="space-y-1.5">
                {[
                  { icon: <PlusCircle className="w-4 h-4" />, label: 'New order', href: '/pos' },
                  { icon: <BarChart3 className="w-4 h-4" />, label: 'Sales report', href: '/reports' },
                  { icon: <Package className="w-4 h-4" />, label: 'Check inventory', href: '/inventory' },
                  { icon: <Tag className="w-4 h-4" />, label: 'Apply promo', href: '/promos' },
                  { icon: <Printer className="w-4 h-4" />, label: 'Print EOD report', href: '/reports/eod' },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                      <span className="text-slate-400">{action.icon}</span>
                      {action.label}
                    </button>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Payment Split */}
            <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Payment split</h2>
              <div className="relative h-32">
                <Doughnut data={paymentChartData} options={paymentChartOptions as never} />
              </div>
              <div className="flex justify-center gap-4 mt-3">
                {[
                  { color: '#b45309', label: 'Cash', pct: `${paymentSplit.cash}%` },
                  { color: '#d97706', label: 'GCash', pct: `${paymentSplit.gcash}%` },
                  { color: '#fbbf24', label: 'Card', pct: `${paymentSplit.card}%` },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: p.color }} />
                    {p.label} {p.pct}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Bottom Grid: Staff + Stock ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Staff Performance */}
          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Staff performance</h2>
            <p className="text-sm text-slate-400 py-4 text-center">Staff tracking coming soon</p>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Low stock alerts</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-medium">
                {stockItems.length} items
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockItems.length > 0 ? stockItems.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13px] text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {s.level} {s.unit}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                      s.severity === 'danger'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}
                  >
                    {s.severity === 'danger' ? 'Critical' : 'Low stock'}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-slate-400 py-4 text-center">All stock levels healthy</p>
              )}
            </div>
            <Link href="/inventory">
              <Button variant="outline" className="w-full mt-4 rounded-xl text-sm border-slate-200 dark:border-slate-700">
                Manage inventory
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}