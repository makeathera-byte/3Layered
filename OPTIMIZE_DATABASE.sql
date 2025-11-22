-- ============================================
-- DATABASE OPTIMIZATION FOR HIGH TRAFFIC
-- ============================================
-- Run this in Supabase SQL Editor to optimize database for high traffic

-- ============================================
-- 1. CREATE INDEXES FOR FASTER QUERIES
-- ============================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_items_gin ON public.orders USING GIN (items);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_gin ON public.orders USING GIN (shipping_address);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);

-- Customized orders indexes
CREATE INDEX IF NOT EXISTS idx_customized_orders_user_id ON public.customized_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_customized_orders_user_email ON public.customized_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_customized_orders_order_id ON public.customized_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_customized_orders_status ON public.customized_orders(status);
CREATE INDEX IF NOT EXISTS idx_customized_orders_created_at ON public.customized_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customized_orders_product_id ON public.customized_orders(product_id);

-- Products indexes (if not already exist)
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================
-- 2. OPTIMIZE EXISTING INDEXES
-- ============================================

-- Analyze tables to update statistics
ANALYZE public.orders;
ANALYZE public.customized_orders;
ANALYZE public.products;
ANALYZE public.users;

-- ============================================
-- 3. CREATE MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- Daily order summary (refresh as needed)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_order_summary AS
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
FROM public.orders
GROUP BY DATE(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_order_summary_date ON daily_order_summary(order_date DESC);

-- ============================================
-- 4. OPTIMIZE JSONB QUERIES
-- ============================================

-- The GIN indexes above already optimize JSONB queries
-- Additional optimization: Create function for common JSONB queries

CREATE OR REPLACE FUNCTION get_order_items(order_id_param UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (SELECT items FROM public.orders WHERE id = order_id_param);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 5. CONNECTION POOLING SETTINGS
-- ============================================
-- Note: Supabase handles connection pooling automatically
-- These are just recommendations for your own Postgres instance

-- max_connections = 100 (default is usually fine)
-- shared_buffers = 25% of RAM
-- effective_cache_size = 50-75% of RAM
-- work_mem = 4MB (adjust based on concurrent queries)

-- ============================================
-- 6. VACUUM AND MAINTENANCE
-- ============================================

-- Run periodically to reclaim space and update statistics
-- VACUUM ANALYZE public.orders;
-- VACUUM ANALYZE public.customized_orders;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('orders', 'customized_orders', 'products', 'users')
ORDER BY tablename, indexname;

