-- ============================================
-- SECURITY: Row Level Security (RLS) Policies
-- ============================================
-- Run this AFTER creating tables
-- This implements comprehensive security policies

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_print_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_print_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (Clean slate)
-- ============================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;

-- Products policies
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Cart policies
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart;

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

-- Reviews policies
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

-- Media policies
DROP POLICY IF EXISTS "Public read access" ON public.media;
DROP POLICY IF EXISTS "Admin only write access" ON public.media;

-- Custom print orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.custom_print_orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.custom_print_orders;

-- Custom print files policies
DROP POLICY IF EXISTS "Users can view their own files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Users can upload their own files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Admins can view all files" ON public.custom_print_files;
DROP POLICY IF EXISTS "Admins can manage all files" ON public.custom_print_files;

-- Home content policies
DROP POLICY IF EXISTS "Public read access" ON public.home_content;
DROP POLICY IF EXISTS "Admin write access" ON public.home_content;

-- Settings policies
DROP POLICY IF EXISTS "Public read access" ON public.settings;
DROP POLICY IF EXISTS "Admin write access" ON public.settings;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Public can view non-deleted products
CREATE POLICY "Public read access for products" ON public.products
  FOR SELECT
  USING (deleted_at IS NULL);

-- Admins can manage all products
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- CART TABLE POLICIES
-- ============================================

-- Users can view their own cart
CREATE POLICY "Users can view own cart" ON public.cart
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON public.cart
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Users can create orders
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- ORDER ITEMS TABLE POLICIES
-- ============================================

-- Users can view items of their own orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
      AND public.orders.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
      AND public.orders.user_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================

-- Public can view approved reviews
CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT
  USING (is_approved = true);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own reviews (even if not approved)
CREATE POLICY "Users can view own reviews" ON public.reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- ADMIN SESSIONS POLICIES
-- ============================================

-- Only admins can view sessions
CREATE POLICY "Admins can view sessions" ON public.admin_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Only admins can manage sessions
CREATE POLICY "Admins can manage sessions" ON public.admin_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- MEDIA TABLE POLICIES
-- ============================================

-- Public read access
CREATE POLICY "Public read access" ON public.media
  FOR SELECT
  USING (true);

-- Admin only write access
CREATE POLICY "Admin only write access" ON public.media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- CUSTOM PRINT ORDERS POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.custom_print_orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Users can create their own orders (allow guest orders)
CREATE POLICY "Users can create their own orders" ON public.custom_print_orders
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.custom_print_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON public.custom_print_orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- CUSTOM PRINT FILES POLICIES
-- ============================================

-- Users can view their own files
CREATE POLICY "Users can view their own files" ON public.custom_print_files
  FOR SELECT
  USING (
    (auth.uid() = user_id OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Users can upload their own files
CREATE POLICY "Users can upload their own files" ON public.custom_print_files
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Admins can view all files
CREATE POLICY "Admins can view all files" ON public.custom_print_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Admins can manage all files
CREATE POLICY "Admins can manage all files" ON public.custom_print_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- HOME CONTENT POLICIES
-- ============================================

-- Public read access
CREATE POLICY "Public read access" ON public.home_content
  FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admin write access" ON public.home_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- SETTINGS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "Public read access" ON public.settings
  FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admin write access" ON public.settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'SUCCESS: All RLS policies created!' as status;

