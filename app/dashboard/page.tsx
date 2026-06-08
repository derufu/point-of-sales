'use client';

import { useEffect, useState, useRef } from 'react';
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

// ─── Static Data ──────────────────────────────────────────────────────────────

const ORDERS: Order[] = [
  { num: '#0147', items: 'Latte, Croissant', status: 'ready', amount: '₱185', time: '2:38 PM' },
  { num: '#0146', items: 'Cold Brew × 2', status: 'making', amount: '₱210', time: '2:35 PM' },
  { num: '#0145', items: 'Americano, Sandwich', status: 'ready', amount: '₱160', time: '2:31 PM' },
  { num: '#0144', items: 'Matcha Latte', status: 'queued', amount: '₱130', time: '2:28 PM' },
  { num: '#0143', items: 'Cappuccino, Muffin', status: 'ready', amount: '₱175', time: '2:20 PM' },
  { num: '#0142', items: 'Espresso × 3', status: 'queued', amount: '₱225', time: '2:15 PM' },
];

const TOP_ITEMS: TopItem[] = [
  { name: 'Latte', sub: 'Hot · 12oz', count: 38, rev: '₱4,560', pct: 100 },
  { name: 'Cold Brew', sub: 'Iced · 16oz', count: 29, rev: '₱3,480', pct: 76 },
  { name: 'Americano', sub: 'Hot · 8oz', count: 24, rev: '₱2,160', pct: 63 },
  { name: 'Matcha Latte', sub: 'Hot · 12oz', count: 18, rev: '₱2,340', pct: 47 },
  { name: 'Cappuccino', sub: 'Hot · 8oz', count: 15, rev: '₱1,800', pct: 39 },
];

const STAFF: StaffMember[] = [
  { name: 'Maria R.', initials: 'MR', orders: 42, amt: '₱5,460' },
  { name: 'Carlo D.', initials: 'CD', orders: 38, amt: '₱4,890' },
  { name: 'Jessa P.', initials: 'JP', orders: 35, amt: '₱4,230' },
  { name: 'Renz A.', initials: 'RA', orders: 32, amt: '₱3,852' },
];

const STOCK_ITEMS: StockItem[] = [
  { name: 'Oat milk', level: 15, unit: 'cartons left', severity: 'danger' },
  { name: 'Espresso beans', level: 22, unit: '% remaining', severity: 'warning' },
  { name: 'Vanilla syrup', level: 1, unit: 'bottle left', severity: 'danger' },
];

const HOURS = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
const TODAY_DATA = [120, 380, 820, 1240, 1100, 980, 860, 740, 1050, 820, 690, 520, 310];
const YESTERDAY_DATA = [90, 310, 710, 1100, 980, 860, 780, 690, 920, 750, 620, 470, 280];

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

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const filteredOrders =
    orderFilter === 'all' ? ORDERS : ORDERS.filter((o) => o.status === orderFilter);

  const timeString = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  // Chart data
  const revenueChartData = {
    labels: HOURS.map((h) => `${h}:00`),
    datasets: [
      {
        label: 'Today',
        data: TODAY_DATA,
        backgroundColor: '#b45309',
        borderRadius: 4,
        borderSkipped: false as const,
      },
      ...(showYesterday
        ? [
            {
              label: 'Yesterday',
              data: YESTERDAY_DATA,
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
    labels: ['Cash 40%', 'GCash 35%', 'Card 25%'],
    datasets: [
      {
        data: [40, 35, 25],
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
            value="₱18,432"
            sub="+12.4% vs yesterday"
            trend="up"
          />
          <MetricCard
            icon={<ShoppingCart className="w-3.5 h-3.5" />}
            label="Orders"
            value="147"
            sub="+8 orders vs yesterday"
            trend="up"
          />
          <MetricCard
            icon={<CreditCard className="w-3.5 h-3.5" />}
            label="Avg. order value"
            value="₱125"
            sub="-₱3 vs yesterday"
            trend="down"
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
                {TOP_ITEMS.map((item) => (
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
                  { color: '#b45309', label: 'Cash', pct: '40%' },
                  { color: '#d97706', label: 'GCash', pct: '35%' },
                  { color: '#fbbf24', label: 'Card', pct: '25%' },
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
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {STAFF.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                      {s.initials}
                    </div>
                    <span className="text-[13px] text-slate-900 dark:text-white">{s.name}</span>
                  </div>
                  <span className="text-[12px] text-slate-400">{s.orders} orders</span>
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{s.amt}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Low stock alerts</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-medium">
                {STOCK_ITEMS.length} items
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {STOCK_ITEMS.map((s) => (
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
              ))}
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