# BrewPOS Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com) and sign up
   - Create a new project

2. **Get Your Credentials**
   - Navigate to Project Settings → API
   - Copy your `Project URL` and `Anon Public Key`

3. **Create Environment File**
   - Copy `.env.example` to `.env.local`
   - Paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Set Up Authentication

In Supabase Dashboard:
1. Go to **Authentication → Providers**
2. Enable **Email/Password** provider
3. Go to **Authentication → Email Templates**
4. Customize your email templates (optional)

### 4. Create Database Tables (Optional)

Create a `stores` table to track coffee shops:

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own store"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Features

- **Landing Page** - Professional marketing site
- **Authentication** - Sign up, login with Supabase
- **POS System** - Coffee shop point-of-sale interface
- **Dashboard** - User dashboard with quick access
- **Responsive Design** - Works on all devices
- **Dark Mode** - Built-in dark mode support

## File Structure

```
app/
├── page.tsx                    # Landing page
├── auth/
│   ├── login/page.tsx         # Login page
│   └── signup/page.tsx        # Signup page
├── dashboard/page.tsx         # User dashboard
├── pos/page.tsx              # POS system
└── actions/
    └── auth.ts               # Auth server actions
lib/
├── supabase/
│   ├── client.ts            # Client-side Supabase
│   └── server.ts            # Server-side Supabase
└── utils.ts
components/ui/                # shadcn/ui components
```

## Next Steps

1. Customize the menu items in `/app/pos/page.tsx`
2. Add real database integration for orders
3. Create inventory management system
4. Add analytics dashboard
5. Deploy to Vercel

## Troubleshooting

**Blank login page?**
- Check if Supabase credentials are set in `.env.local`
- Ensure Email/Password auth is enabled in Supabase

**Can't create account?**
- Verify Supabase project is active
- Check email configuration in Supabase settings

**Build errors?**
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run dev`
