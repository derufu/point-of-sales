import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  store_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  tax_amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  price: number;
  description: string | null;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Profile Functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

// Order Functions
export async function createOrder(
  userId: string,
  orderData: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return null;
  }

  return data;
}

export async function getOrders(userId: string, limit = 50, offset = 0) {
  const supabase = createClient();

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], total: 0 };
  }

  return { orders: data || [], total: count || 0 };
}

export async function getOrderStats(userId: string, days = 30) {
  const supabase = createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching order stats:', error);
    return { totalRevenue: 0, orderCount: 0, avgOrder: 0 };
  }

  const orders = data || [];
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    orderCount: orders.length,
    avgOrder: orders.length > 0 ? parseFloat((totalRevenue / orders.length).toFixed(2)) : 0,
  };
}

// Menu Item Functions
export async function createMenuItem(
  userId: string,
  itemData: Omit<MenuItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      ...itemData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating menu item:', error);
    return null;
  }

  return data;
}

export async function getMenuItems(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return data || [];
}

export async function updateMenuItem(itemId: string, updates: Partial<MenuItem>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating menu item:', error);
    return null;
  }

  return data;
}

export async function deleteMenuItem(itemId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }

  return true;
}

// Analytics Functions
export async function recordOrder(
  userId: string,
  orderAmount: number,
  itemCount: number
) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: existingAnalytics } = await supabase
    .from('daily_analytics')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existingAnalytics) {
    // Update existing record
    const newTotal =
      parseFloat(existingAnalytics.total_revenue?.toString() || '0') + orderAmount;
    const newOrderCount = existingAnalytics.total_orders + 1;
    const newItemCount = existingAnalytics.total_items_sold + itemCount;

    return supabase
      .from('daily_analytics')
      .update({
        total_revenue: newTotal,
        total_orders: newOrderCount,
        total_items_sold: newItemCount,
        average_order_value: newTotal / newOrderCount,
      })
      .eq('id', existingAnalytics.id);
  } else {
    // Create new record
    return supabase.from('daily_analytics').insert({
      user_id: userId,
      date: today,
      total_orders: 1,
      total_revenue: orderAmount,
      total_items_sold: itemCount,
      average_order_value: orderAmount,
    });
  }
}

export async function getDailyAnalytics(userId: string, days = 30) {
  const supabase = createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }

  return data || [];
}
