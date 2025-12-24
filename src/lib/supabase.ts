import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          created_at: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          name: string;
          monthly_invoice_amount: number;
          number_of_guards: number;
          price_per_guard: number;
          guard_salary: number;
          total_net_pay: number;
          created_at: string;
          updated_at: string;
        };
      };
      invoice_months: {
        Row: {
          id: string;
          assignment_id: string;
          month: number;
          year: number;
          total_invoice_amount: number;
          status: 'paid' | 'due';
          date_paid: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          invoice_month_id: string;
          assignment_id: string;
          receipt_url: string | null;
          amount: number;
          payment_date: string;
          created_at: string;
        };
      };
      company_settings: {
        Row: {
          id: string;
          logo_url: string | null;
          company_name: string;
          updated_at: string;
        };
      };
    };
  };
}
