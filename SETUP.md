# POS System - Complete Setup Guide

## ✅ What's Been Implemented

### Authentication System
- **Login page** (`/auth/login`) - Sign in with email and password
- **Registration page** (`/auth/signup`) - Create new account with full name, email, and strong password validation
- **Server actions** - Secure server-side auth operations using Supabase
- **Route protection** - Middleware protecting `/profile` route and auth pages
- **Profile page** - Edit user information (phone, location, bio)
- **Landing page** - Home page with dynamic auth state

### Technical Features
- ✅ Next.js 16.2.7 with App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS v4
- ✅ Supabase authentication
- ✅ Server-side form validation
- ✅ Protected routes with middleware
- ✅ Client & server Supabase clients
- ✅ Password requirements: 8+ chars, uppercase, number, special character

---

## 🚀 Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New project"
4. Fill in project details:
   - **Name**: `point-of-sales` (or your choice)
   - **Database Password**: Create a strong password
   - **Region**: Select closest to you
5. Click "Create new project" and wait for setup (~5 minutes)

### Step 2: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Configure Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and paste your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

3. Save the file

### Step 4: Configure Supabase Email Templates (Optional but Recommended)

1. In Supabase, go to **Authentication** → **Email Templates**
2. Customize the confirmation email if desired
3. Configure redirect URLs:
   - Go to **Authentication** → **URL Configuration**
   - Add redirect URLs:
     - Local: `http://localhost:3000/`
     - Production: `https://your-domain.com/`

### Step 5: Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure settings as needed

---

## 📱 Available Routes

### Public Routes
- `/` - Landing page (home)
- `/auth/login` - Login page
- `/auth/signup` - Registration page

### Protected Routes (requires authentication)
- `/profile` - User profile (edit name, phone, location, bio)

---

## 🔐 Authentication Flow

### Sign Up
1. User goes to `/auth/signup`
2. Fills in name, email, password
3. Password is validated (8+ chars, uppercase, number, special char)
4. Account created in Supabase
5. Redirected to `/auth/login` with confirmation message
6. User confirms email (if email verification enabled)

### Sign In
1. User goes to `/auth/login`
2. Enters email and password
3. Authenticated with Supabase
4. Redirected to `/` (home page)
5. User can access `/profile` page
6. Navigation shows "Logout" button when authenticated

### Logout
1. Click "Logout" button (only visible when authenticated)
2. User session cleared
3. Redirected to `/auth/login`

---

## 🧪 Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Test the flow:
   - Click "Get Started" on landing page
   - Go to `/auth/signup` and create an account
   - Go to `/auth/login` and sign in
   - Visit `/profile` to see your account
   - Click "Logout" to sign out

---

## 📦 Project Structure

```
app/
├── page.tsx                    # Landing page (with auth state)
├── layout.tsx                  # Root layout
├── api/route.ts               # API endpoint
├── auth/
│   ├── login/page.tsx         # Login page
│   ├── signup/page.tsx        # Signup page
│   └── layout.tsx             # Auth layout
├── profile/
│   └── page.tsx               # User profile (protected)
├── actions/
│   └── auth.ts                # Server actions for auth
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Client-side Supabase
│   │   └── server.ts          # Server-side Supabase
│   └── definitions.ts         # Types & schemas
└── ui/
    └── signup-form.tsx        # Signup form component

middleware.ts                  # Route protection middleware
```

---

## 🔗 Server Actions

### `signup(state, formData)`
- Creates a new user account
- Validates form fields with Zod
- Returns to login page on success
- Returns errors on validation failure

### `login(state, formData)`
- Signs in user with email/password
- Validates inputs
- Redirects to home page on success
- Returns error message on failure

### `logout()`
- Signs out the current user
- Redirects to login page

### `getUser()`
- Fetches current authenticated user
- Returns null if not authenticated

---

## 🛠️ Customization

### Add More User Fields
Edit `app/profile/page.tsx` and `app/actions/auth.ts` to store additional fields in Supabase user metadata.

### Change Password Requirements
Edit `app/actions/auth.ts` - modify the `SignupFormSchema` regex patterns.

### Customize Styling
All pages use Tailwind CSS. Modify classes in:
- `/app/page.tsx` (landing page)
- `/app/auth/login/page.tsx` (login page)
- `/app/auth/signup/page.tsx` (signup page)
- `/app/profile/page.tsx` (profile page)

---

## ⚠️ Security Notes

- **Never commit `.env.local`** - It's in `.gitignore`
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser (safe for public keys)
- Sensitive data (passwords, secrets) should never be exposed
- All auth operations use Supabase's built-in security
- Password requirements prevent weak passwords

---

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Next Steps

1. Set up Supabase project (Steps 1-2 above)
2. Configure environment variables (Step 3)
3. Run `npm run dev` and test
4. Deploy to Vercel:
   - Add environment variables in Vercel dashboard
   - Push to GitHub
   - Vercel will auto-deploy

---

## ❓ Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Make sure `.env.local` exists in project root
- Check spelling of environment variable names
- Restart dev server after adding `.env.local`

### Login/signup not working
- Verify Supabase project URL and key are correct
- Check Supabase dashboard for any errors
- Make sure email provider is enabled in Supabase

### Profile page shows "not found"
- Make sure you're logged in
- Check browser DevTools console for errors
- Verify middleware is running

### Password validation failing
- Password must have: 8+ chars, uppercase letter, number, special char (!@#$%^&*)
- Example valid password: `Password123!`
