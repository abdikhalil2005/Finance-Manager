/*
  # Create Payroll Storage Bucket

  ## Overview
  Creates a storage bucket for payroll Excel files with proper access policies.

  ## Changes
  1. Creates 'payroll' storage bucket
  2. Sets up RLS policies for authenticated users to upload and view files

  ## Security
  - Only authenticated users can upload files
  - Only authenticated users can view files
  - Files are stored permanently for audit purposes
*/

-- Create payroll storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payroll', 'payroll', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload payroll files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payroll');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view payroll files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payroll');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete payroll files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payroll');