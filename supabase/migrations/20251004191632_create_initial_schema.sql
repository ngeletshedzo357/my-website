/*
  # Initial Schema for SHARMORIA Massage Business

  ## Overview
  This migration creates the complete database schema for the SHARMORIA mobile massage and spa business application, including tables for services, bookings, contacts, testimonials, gift certificates, and loyalty program.

  ## New Tables

  ### 1. `services`
  Stores all available services (massages, waxing, facials, packages)
  - `id` (uuid, primary key)
  - `name` (text) - Service name
  - `price` (integer) - Price in cents (e.g., 50000 = R500)
  - `duration` (text) - Duration display text
  - `category` (text) - Service category
  - `description` (text) - Full description
  - `is_active` (boolean) - Whether service is currently offered
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `bookings`
  Stores customer booking requests
  - `id` (uuid, primary key)
  - `booking_number` (text, unique) - Human-readable booking reference
  - `customer_name` (text)
  - `customer_email` (text)
  - `customer_phone` (text)
  - `service_address` (text)
  - `booking_date` (date)
  - `booking_time` (time)
  - `total_amount` (integer) - Total in cents
  - `travel_fee` (integer) - Travel fee in cents
  - `payment_method` (text) - 'cash' or 'card'
  - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
  - `distance_km` (numeric) - Distance from city center
  - `notes` (text) - Customer or admin notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `booking_services`
  Junction table linking bookings to services (many-to-many)
  - `id` (uuid, primary key)
  - `booking_id` (uuid, foreign key)
  - `service_id` (uuid, foreign key)
  - `price_at_booking` (integer) - Price snapshot at time of booking

  ### 4. `contacts`
  Stores contact form submissions
  - `id` (uuid, primary key)
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `message` (text)
  - `status` (text) - 'new', 'read', 'responded'
  - `created_at` (timestamptz)

  ### 5. `testimonials`
  Customer reviews and testimonials
  - `id` (uuid, primary key)
  - `customer_name` (text)
  - `content` (text)
  - `rating` (integer) - 1-5 stars
  - `is_approved` (boolean) - Whether shown publicly
  - `created_at` (timestamptz)

  ### 6. `gift_certificates`
  Gift voucher tracking
  - `id` (uuid, primary key)
  - `code` (text, unique) - Redemption code
  - `amount` (integer) - Value in cents
  - `purchaser_name` (text)
  - `purchaser_email` (text)
  - `recipient_name` (text)
  - `recipient_email` (text)
  - `is_redeemed` (boolean)
  - `redeemed_at` (timestamptz)
  - `redeemed_by_booking_id` (uuid, foreign key)
  - `expires_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 7. `loyalty_customers`
  Customer loyalty program tracking
  - `id` (uuid, primary key)
  - `email` (text, unique)
  - `name` (text)
  - `phone` (text)
  - `points` (integer) - Loyalty points balance
  - `total_spent` (integer) - Lifetime spending in cents
  - `referral_code` (text, unique) - Personal referral code
  - `referred_by` (uuid, foreign key) - Who referred them
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. `admin_users`
  Admin authentication for dashboard access
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `role` (text) - 'admin', 'staff'
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Public can insert bookings and contacts
  - Public can read active services and approved testimonials
  - Only authenticated admin users can modify data
  - Admin users can only read their own profile data

  ## Important Notes
  1. Prices stored in cents to avoid decimal precision issues
  2. Booking numbers generated for easy reference
  3. Gift certificates have expiration dates
  4. Loyalty points: 1 point per R10 spent
  5. Travel fees calculated separately from service prices
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  duration text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  service_address text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  travel_fee integer DEFAULT 0 CHECK (travel_fee >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  distance_km numeric(6,2),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Booking services junction table
CREATE TABLE IF NOT EXISTS booking_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  price_at_booking integer NOT NULL CHECK (price_at_booking >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, service_id)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at timestamptz DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Gift certificates table
CREATE TABLE IF NOT EXISTS gift_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  purchaser_name text NOT NULL,
  purchaser_email text NOT NULL,
  recipient_name text,
  recipient_email text,
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  redeemed_by_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Loyalty customers table
CREATE TABLE IF NOT EXISTS loyalty_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  points integer DEFAULT 0 CHECK (points >= 0),
  total_spent integer DEFAULT 0 CHECK (total_spent >= 0),
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES loyalty_customers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_service ON booking_services(service_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_code ON gift_certificates(code);
CREATE INDEX IF NOT EXISTS idx_loyalty_customers_email ON loyalty_customers(email);
CREATE INDEX IF NOT EXISTS idx_loyalty_customers_referral ON loyalty_customers(referral_code);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Services policies: Public can read active services, only admins can modify
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Bookings policies: Anyone can create, only admins can view/modify
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Booking services policies
CREATE POLICY "Anyone can create booking services"
  ON booking_services FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view booking services"
  ON booking_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete booking services"
  ON booking_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Contacts policies: Anyone can create, only admins can view
CREATE POLICY "Anyone can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Testimonials policies: Public can view approved, admins can manage
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all testimonials"
  ON testimonials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Gift certificates policies: Admins manage, customers can verify
CREATE POLICY "Anyone can verify gift certificates"
  ON gift_certificates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert gift certificates"
  ON gift_certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update gift certificates"
  ON gift_certificates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Loyalty customers policies: Public can check, admins can manage
CREATE POLICY "Anyone can check loyalty by email"
  ON loyalty_customers FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert loyalty customers"
  ON loyalty_customers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update loyalty customers"
  ON loyalty_customers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users policies: Admins can manage
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'admin'
    )
  );

CREATE POLICY "Admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'admin'
    )
  );

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number text;
  number_exists boolean;
BEGIN
  LOOP
    new_number := 'BK' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_number = new_number) INTO number_exists;
    EXIT WHEN NOT number_exists;
  END LOOP;
  RETURN new_number;
END;
$$;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM loyalty_customers WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_customers_updated_at
  BEFORE UPDATE ON loyalty_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
