/*
  # Financial Management System Schema

  ## Overview
  Complete database schema for internal financial management system for a security services company.
  This system tracks assignments, invoices, receipts, and various expense categories.

  ## Tables Created
  
  ### 1. profiles
  - Extends auth.users with user profile information
  - Fields: id (FK to auth.users), email, full_name, role, created_at
  
  ### 2. company_settings
  - Stores company configuration including logo
  - Fields: id, logo_url, company_name, updated_at
  
  ### 3. assignments
  - Client/school assignments with guard and payment details
  - Fields: id, name, monthly_invoice_amount, number_of_guards, price_per_guard, guard_salary, total_net_pay, created_at, updated_at
  
  ### 4. invoice_months
  - Monthly invoice records per assignment
  - Fields: id, assignment_id (FK), month, year, total_invoice_amount, status (paid/due), date_paid, created_at, updated_at
  
  ### 5. receipts
  - Auto-generated from paid invoice months
  - Fields: id, invoice_month_id (FK), assignment_id (FK), receipt_url, amount, payment_date, created_at
  
  ### 6. salaries
  - Monthly salary expenses with payroll file
  - Fields: id, month, year, total_amount, payroll_file_url, created_at
  
  ### 7. rent
  - Monthly rent expenses
  - Fields: id, month, year, amount, status (paid/due), date_paid, created_at
  
  ### 8. uniforms
  - Monthly uniform expenses
  - Fields: id, month, year, amount, date_paid, notes, created_at
  
  ### 9. fuel
  - Monthly fuel expenses
  - Fields: id, month, year, amount, date_paid, notes, created_at
  
  ### 10. food_bill
  - Monthly food bill expenses
  - Fields: id, month, year, total_amount, status (paid/due), date_paid, created_at
  
  ### 11. petty_cashes
  - Monthly petty cash expenses
  - Fields: id, month, year, amount, notes, created_at
  
  ## Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated users only
  - All tables require authentication for read/write operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Company settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url text,
  company_name text DEFAULT 'Security Services Company',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view company settings"
  ON company_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update company settings"
  ON company_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert company settings"
  ON company_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default company settings
INSERT INTO company_settings (company_name) VALUES ('Security Services Company')
ON CONFLICT DO NOTHING;

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  monthly_invoice_amount numeric(12, 2) NOT NULL DEFAULT 0,
  number_of_guards integer NOT NULL DEFAULT 0,
  price_per_guard numeric(12, 2) NOT NULL DEFAULT 0,
  guard_salary numeric(12, 2) NOT NULL DEFAULT 0,
  total_net_pay numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (true);

-- Invoice months table
CREATE TABLE IF NOT EXISTS invoice_months (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  total_invoice_amount numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('paid', 'due')),
  date_paid date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, month, year)
);

ALTER TABLE invoice_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoice months"
  ON invoice_months FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoice months"
  ON invoice_months FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice months"
  ON invoice_months FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete invoice months"
  ON invoice_months FOR DELETE
  TO authenticated
  USING (true);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_month_id uuid NOT NULL REFERENCES invoice_months(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  receipt_url text,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update receipts"
  ON receipts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete receipts"
  ON receipts FOR DELETE
  TO authenticated
  USING (true);

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  payroll_file_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(month, year)
);

ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view salaries"
  ON salaries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert salaries"
  ON salaries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update salaries"
  ON salaries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete salaries"
  ON salaries FOR DELETE
  TO authenticated
  USING (true);

-- Rent table
CREATE TABLE IF NOT EXISTS rent (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('paid', 'due')),
  date_paid date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(month, year)
);

ALTER TABLE rent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rent"
  ON rent FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert rent"
  ON rent FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rent"
  ON rent FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rent"
  ON rent FOR DELETE
  TO authenticated
  USING (true);

-- Uniforms table
CREATE TABLE IF NOT EXISTS uniforms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  date_paid date,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE uniforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view uniforms"
  ON uniforms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert uniforms"
  ON uniforms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update uniforms"
  ON uniforms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete uniforms"
  ON uniforms FOR DELETE
  TO authenticated
  USING (true);

-- Fuel table
CREATE TABLE IF NOT EXISTS fuel (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  date_paid date,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fuel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fuel"
  ON fuel FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert fuel"
  ON fuel FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fuel"
  ON fuel FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fuel"
  ON fuel FOR DELETE
  TO authenticated
  USING (true);

-- Food bill table
CREATE TABLE IF NOT EXISTS food_bill (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('paid', 'due')),
  date_paid date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(month, year)
);

ALTER TABLE food_bill ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view food bill"
  ON food_bill FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert food bill"
  ON food_bill FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update food bill"
  ON food_bill FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete food bill"
  ON food_bill FOR DELETE
  TO authenticated
  USING (true);

-- Petty cashes table
CREATE TABLE IF NOT EXISTS petty_cashes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  amount numeric(12, 2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE petty_cashes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view petty cashes"
  ON petty_cashes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert petty cashes"
  ON petty_cashes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update petty cashes"
  ON petty_cashes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete petty cashes"
  ON petty_cashes FOR DELETE
  TO authenticated
  USING (true);

-- Function to auto-create receipt when invoice month is marked as paid
CREATE OR REPLACE FUNCTION create_receipt_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status = 'due') THEN
    INSERT INTO receipts (invoice_month_id, assignment_id, amount, payment_date)
    VALUES (NEW.id, NEW.assignment_id, NEW.total_invoice_amount, COALESCE(NEW.date_paid, CURRENT_DATE));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create receipts
DROP TRIGGER IF EXISTS trigger_create_receipt_on_paid ON invoice_months;
CREATE TRIGGER trigger_create_receipt_on_paid
  AFTER INSERT OR UPDATE ON invoice_months
  FOR EACH ROW
  EXECUTE FUNCTION create_receipt_on_paid();