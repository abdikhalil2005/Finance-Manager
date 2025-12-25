/*
  # Add Advance Expenses Table

  ## Overview
  Creates a table to track advance payments/expenses with monthly tracking.

  ## New Tables
  - `advance`
    - `id` (uuid, primary key)
    - `month` (integer, 1-12)
    - `year` (integer)
    - `amount` (numeric)
    - `notes` (text, optional)
    - `created_at` (timestamp)
    - Unique constraint on (month, year) to prevent duplicates

  ## Security
  - Enable RLS on `advance` table
  - Add policies for authenticated users to perform all operations
*/

CREATE TABLE IF NOT EXISTS advance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(month, year)
);

ALTER TABLE advance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view advance"
  ON advance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert advance"
  ON advance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update advance"
  ON advance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete advance"
  ON advance FOR DELETE
  TO authenticated
  USING (true);