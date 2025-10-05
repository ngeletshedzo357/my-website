# Create Admin Account

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "Authentication" in the left sidebar
3. Click "Add User" button
4. Enter:
   - Email: `admin@sharmoria.com` (or your preferred admin email)
   - Password: Create a strong password
   - Check "Auto Confirm User"
5. Click "Create User"

## Option 2: Using SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Run this SQL (replace with your email and password):

```sql
-- This creates an admin user
-- Replace 'your-email@example.com' and 'your-secure-password' with your actual credentials
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sharmoria.com',
  crypt('YourSecurePassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## Access Your Dashboard

Once you've created the admin account:

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:5173/admin/login`
3. Login with your admin credentials
4. You'll be redirected to: `http://localhost:5173/admin/dashboard`

## What You Can Do in the Dashboard

- **View all bookings** - See customer appointments, confirm/complete/cancel them
- **Manage messages** - Read and respond to contact form submissions
- **Review testimonials** - Approve or reject customer reviews
- **Track revenue** - See total revenue from completed bookings
- **Monitor activity** - View pending bookings and new messages

## Security Note

Make sure to use a strong password for your admin account. This account has full access to all customer data and bookings.
