-- ============================================
-- Migration 008: Row Level Security for Custom Print Tables
-- ============================================

-- ============================================
-- RLS FOR CUSTOM PRINT ORDERS
-- ============================================

-- Enable RLS
ALTER TABLE public.custom_print_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Service role full access" ON public.custom_print_orders;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.custom_print_orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.custom_print_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Anyone can create orders (for guest users)
CREATE POLICY "Users can create orders" ON public.custom_print_orders
  FOR INSERT
  WITH CHECK (true);

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON public.custom_print_orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can delete orders
CREATE POLICY "Admins can delete orders" ON public.custom_print_orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS FOR CUSTOM PRINT FILES
-- ============================================

-- Enable RLS
ALTER TABLE public.custom_print_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Admins can view all files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Users can create files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Admins can update files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Admins can delete files" ON public.custom_print_files;

-- Users can view their own files
CREATE POLICY "Users can view own files" ON public.custom_print_files
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all files
CREATE POLICY "Admins can view all files" ON public.custom_print_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Anyone can create files
CREATE POLICY "Users can create files" ON public.custom_print_files
  FOR INSERT
  WITH CHECK (true);

-- Admins can update files
CREATE POLICY "Admins can update files" ON public.custom_print_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can delete files
CREATE POLICY "Admins can delete files" ON public.custom_print_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS FOR MEDIA
-- ============================================

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON public.media;
DROP POLICY IF EXISTS "Admin write access" ON public.media;

-- Allow public read access
CREATE POLICY "Public read access" ON public.media
  FOR SELECT
  USING (true);

-- Allow admins to insert/update/delete
CREATE POLICY "Admin write access" ON public.media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

