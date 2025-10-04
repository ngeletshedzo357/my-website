import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_address: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  travel_fee: number;
  payment_method: string;
  status: string;
  distance_km?: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string;
  price_at_booking: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export interface GiftCertificate {
  id: string;
  code: string;
  amount: number;
  purchaser_name: string;
  purchaser_email: string;
  recipient_name?: string;
  recipient_email?: string;
  is_redeemed: boolean;
  redeemed_at?: string;
  redeemed_by_booking_id?: string;
  expires_at: string;
  created_at: string;
}

export interface LoyaltyCustomer {
  id: string;
  email: string;
  name: string;
  phone: string;
  points: number;
  total_spent: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}
