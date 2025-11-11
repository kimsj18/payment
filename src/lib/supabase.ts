import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please set it in your .env.local file.');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please set it in your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Magazine {
  id?: string;
  category: string;
  title: string;
  description: string;
  content: string;
  tags: string[] | null;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id?: string;
  transaction_key: string;
  amount: number;
  status: "Paid" | "Cancelled";
  start_at: string;
  end_at: string;
  end_grace_at: string;
  next_schedule_at: string;
  next_schedule_id: string;
  created_at?: string;
  updated_at?: string;
}

