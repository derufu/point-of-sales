# Supabase SQL Setup Guide

## Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://app.supabase.com/
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Create Tables

Copy and paste the entire SQL from `supabase/migrations/001_create_profile_schema.sql` into the SQL editor and click **Run**.

This creates:
- **profiles** - User store information
- **orders** - Order history
- **order_items** - Items in each order
- **menu_items** - Your coffee shop menu
- **daily_analytics** - Daily sales statistics

### Step 3: Verify Tables Were Created

In the Supabase dashboard, go to **Table Editor** and verify all 5 tables exist:
- `profiles`
- `orders`
- `order_items`
- `menu_items`
- `daily_analytics`

## Database Schema

### profiles
```
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- store_name: VARCHAR
- email: VARCHAR
- avatar_url: TEXT
- bio: TEXT
- phone: VARCHAR
- address: TEXT
- city, state, postal_code, country: VARCHAR
- website: TEXT
- created_at, updated_at: TIMESTAMP
```

### orders
```
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- order_number: VARCHAR (Unique)
- total_amount: DECIMAL
- tax_amount: DECIMAL
- payment_method: VARCHAR ('cash' or 'card')
- status: VARCHAR ('pending', 'completed', 'cancelled')
- notes: TEXT
- created_at, updated_at: TIMESTAMP
```

### order_items
```
- id: UUID (Primary Key)
- order_id: UUID (References orders)
- item_name: VARCHAR
- quantity: INTEGER
- unit_price: DECIMAL
- subtotal: DECIMAL
- created_at: TIMESTAMP
```

### menu_items
```
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- name: VARCHAR
- category: VARCHAR
- price: DECIMAL
- description: TEXT
- is_available: BOOLEAN
- image_url: TEXT
- created_at, updated_at: TIMESTAMP
```

### daily_analytics
```
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- date: DATE
- total_orders: INTEGER
- total_revenue: DECIMAL
- total_items_sold: INTEGER
- average_order_value: DECIMAL
- created_at, updated_at: TIMESTAMP
```

## Key Features

### Row Level Security (RLS)
- Each user can only view/edit their own data
- Automatic enforcement via Supabase policies
- No sensitive data leakage

### Automatic Triggers
- `updated_at` timestamp automatically updated on changes
- Profile created automatically when user signs up
- No manual data management needed

### Indexes
- Optimized for fast queries on common filters
- User IDs, dates, and status indexed
- Better performance for analytics queries

## Using the Profile Service

The `lib/services/profile.ts` file provides TypeScript functions for all database operations:

### Get Profile
```typescript
import { getProfile } from '@/lib/services/profile';

const profile = await getProfile(userId);
```

### Update Profile
```typescript
import { updateProfile } from '@/lib/services/profile';

await updateProfile(userId, {
  store_name: 'New Coffee Shop Name',
  phone: '+1234567890'
});
```

### Create Order
```typescript
import { createOrder, recordOrder } from '@/lib/services/profile';

const order = await createOrder(userId, {
  order_number: 'ORD-001',
  total_amount: 25.50,
  tax_amount: 2.50,
  payment_method: 'card'
});

// Also record in analytics
await recordOrder(userId, 25.50, 5);
```

### Get Orders
```typescript
import { getOrders, getOrderStats } from '@/lib/services/profile';

const { orders, total } = await getOrders(userId);
const stats = await getOrderStats(userId, 30); // Last 30 days
```

### Menu Items
```typescript
import { 
  createMenuItem, 
  getMenuItems, 
  updateMenuItem, 
  deleteMenuItem 
} from '@/lib/services/profile';

// Create
const item = await createMenuItem(userId, {
  name: 'Cappuccino',
  category: 'Coffee',
  price: 5.50,
  is_available: true
});

// Get all
const items = await getMenuItems(userId);

// Update
await updateMenuItem(itemId, { price: 6.00 });

// Delete
await deleteMenuItem(itemId);
```

### Analytics
```typescript
import { getDailyAnalytics } from '@/lib/services/profile';

const stats = await getDailyAnalytics(userId, 30);
```

## Integration with Your App

The profile system automatically integrates with:

1. **Signup** - Profile created with `store_name` from signup form
2. **Profile Page** - Shows and updates profile data
3. **POS System** - Can save orders to database
4. **Analytics** - Tracks daily sales metrics

## Testing the Setup

1. Create a new account in your app
2. Go to `/profile` - should load your data
3. Update your store name
4. Create an order in `/pos`
5. Check Supabase Table Editor to see the data

## Troubleshooting

**"Permission denied" error?**
- Check RLS policies are enabled
- Verify user is authenticated
- Check the user_id matches the auth user

**Profile not created on signup?**
- Verify the `handle_new_user` trigger exists
- Check Supabase function logs
- Make sure email/password auth is enabled

**Can't see data in Table Editor?**
- RLS policies might be hiding data
- Try as the authenticated user
- Check your actual user_id matches

## Next Steps

1. Add analytics dashboard to display `daily_analytics` data
2. Implement order history view
3. Add menu management interface
4. Create detailed sales reports
