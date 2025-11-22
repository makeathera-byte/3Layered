-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Migration 002: Security Rules
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (is_admin());

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT
  USING (deleted_at IS NULL);

-- Admins can insert products
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update products
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (is_admin());

-- Admins can soft delete products
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (is_admin());

-- ============================================
-- CART POLICIES
-- ============================================

-- Users can read their own cart
CREATE POLICY "Users can read own cart"
  ON public.cart FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert into their own cart
CREATE POLICY "Users can insert into own cart"
  ON public.cart FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
  ON public.cart FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own cart
CREATE POLICY "Users can delete from own cart"
  ON public.cart FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all carts
CREATE POLICY "Admins can read all carts"
  ON public.cart FOR SELECT
  USING (is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  USING (is_admin());

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (is_admin());

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

-- Users can read their own order items
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert their own order items
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT
  USING (is_admin());

-- Admins can update all order items
CREATE POLICY "Admins can update all order items"
  ON public.order_items FOR UPDATE
  USING (is_admin());

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

-- Users can read their own reviews (even unapproved)
CREATE POLICY "Users can read own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create reviews for their own orders
CREATE POLICY "Users can create reviews for own orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can update their own unapproved reviews
CREATE POLICY "Users can update own unapproved reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false);

-- Admins can read all reviews
CREATE POLICY "Admins can read all reviews"
  ON public.reviews FOR SELECT
  USING (is_admin());

-- Admins can update all reviews
CREATE POLICY "Admins can update all reviews"
  ON public.reviews FOR UPDATE
  USING (is_admin());

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (is_admin());

-- ============================================
-- ADMIN SESSIONS POLICIES
-- ============================================

-- Only admins can manage sessions
CREATE POLICY "Admins can manage sessions"
  ON public.admin_sessions FOR ALL
  USING (is_admin());
