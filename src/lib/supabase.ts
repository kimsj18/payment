import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

