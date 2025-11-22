-- ============================================
-- Migration 007: Add Custom Print Tables
-- ============================================

-- ============================================
-- CUSTOM PRINT ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled')),
  quote_amount DECIMAL(10, 2),
  quote_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOM PRINT FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_print_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  mime_type TEXT,
  file_extension TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'custom-prints',
  description TEXT,
  is_attached_to_order BOOLEAN DEFAULT false,
  order_id UUID REFERENCES public.custom_print_orders(id) ON DELETE SET NULL,
  uploaded_by TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'archived', 'deleted')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- MEDIA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  description TEXT,
  category TEXT,
  alt_text TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Custom print orders indexes
CREATE INDEX IF NOT EXISTS idx_custom_print_orders_user_id ON public.custom_print_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_print_orders_status ON public.custom_print_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_print_orders_created_at ON public.custom_print_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_print_orders_user_email ON public.custom_print_orders(user_email);

-- Custom print files indexes
CREATE INDEX IF NOT EXISTS idx_custom_print_files_user_id ON public.custom_print_files(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_print_files_order_id ON public.custom_print_files(order_id);
CREATE INDEX IF NOT EXISTS idx_custom_print_files_status ON public.custom_print_files(status);
CREATE INDEX IF NOT EXISTS idx_custom_print_files_created_at ON public.custom_print_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_print_files_deleted_at ON public.custom_print_files(deleted_at) WHERE deleted_at IS NULL;

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_media_category ON public.media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Triggers for custom_print_orders
DROP TRIGGER IF EXISTS update_custom_print_orders_updated_at ON public.custom_print_orders;
CREATE TRIGGER update_custom_print_orders_updated_at 
  BEFORE UPDATE ON public.custom_print_orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for custom_print_files
DROP TRIGGER IF EXISTS update_custom_print_files_updated_at ON public.custom_print_files;
CREATE TRIGGER update_custom_print_files_updated_at 
  BEFORE UPDATE ON public.custom_print_files
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for media
DROP TRIGGER IF EXISTS update_media_updated_at ON public.media;
CREATE TRIGGER update_media_updated_at 
  BEFORE UPDATE ON public.media
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

