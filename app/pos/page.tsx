'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: React.ReactNode;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 3.5, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '2', name: 'Americano', price: 4.0, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '3', name: 'Cappuccino', price: 5.0, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '4', name: 'Latte', price: 5.5, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '5', name: 'Macchiato', price: 4.5, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '6', name: 'Mocha', price: 6.0, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '7', name: 'Flat White', price: 5.0, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '8', name: 'Cold Brew', price: 4.5, category: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: '9', name: 'Iced Latte', price: 5.5, category: 'Iced', icon: <Coffee className="w-4 h-4" /> },
  { id: '10', name: 'Iced Cappuccino', price: 5.5, category: 'Iced', icon: <Coffee className="w-4 h-4" /> },
];

export default function POSPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<{ total: number; items: number; time: string } | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLastOrder({
      total,
      items: cart.reduce((sum, item) => sum + item.quantity, 0),
      time: timeStr,
    });

    setCart([]);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Coffee className="w-12 h-12 text-amber-600 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              BrewPOS
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="rounded-lg border-slate-200 dark:border-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-69px)] gap-4 p-4 overflow-hidden">
        {/* Menu Section */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Menu</h2>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto flex-1 pr-2">
            {menuItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-white dark:bg-slate-800 border-0"
                onClick={() => addToCart(item)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart & Checkout Section */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Cart Header */}
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-700" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order</h2>
            {cart.length > 0 && (
              <span className="ml-auto bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cart.length}
              </span>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto border rounded-lg bg-white dark:bg-slate-800 p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No items yet</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-600 rounded-lg border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold px-2">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <Card className="p-4 bg-white dark:bg-slate-800 border-0 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tax (10%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setPaymentMethod('cash')}
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    className="rounded-lg"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    onClick={() => setPaymentMethod('card')}
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="rounded-lg"
                  >
                    💳 Card
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg py-6 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Order
              </Button>
            </Card>
          )}

          {/* Last Order */}
          {lastOrder && (
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-200 text-sm">
                    Order Complete!
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {lastOrder.items} item{lastOrder.items > 1 ? 's' : ''} • ${lastOrder.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {lastOrder.time}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
