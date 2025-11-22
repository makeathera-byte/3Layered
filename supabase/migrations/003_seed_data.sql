-- ============================================
-- SEED DATA
-- Migration 003: Initial Data
-- ============================================

-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Then run this with the actual UUID from auth.users
-- INSERT INTO public.users (id, email, full_name, role)
-- VALUES ('your-admin-uuid-here', 'admin3layered@3layered.com', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Insert sample products for testing
INSERT INTO public.products (title, description, price, category, material, inventory, is_trending, is_featured, images) VALUES
  (
    'Decorative Vase',
    'A modern geometric vase perfect for your living room. Printed with premium PLA filament for a smooth, polished finish.',
    899.00,
    'home-decor',
    'Premium PLA',
    50,
    true,
    true,
    ARRAY['/images/products/vase-1.jpg', '/images/products/vase-2.jpg']
  ),
  (
    'Table Organizer',
    'Keep your desk tidy with this elegant multi-compartment organizer. Features separate spaces for pens, clips, and small items.',
    599.00,
    'table-top',
    'Premium PLA',
    75,
    true,
    false,
    ARRAY['/images/products/organizer-1.jpg']
  ),
  (
    'Superhero Action Figure',
    'Highly detailed superhero figure with articulated joints. Perfect for collectors and enthusiasts.',
    1299.00,
    'action-figure',
    'Premium PLA',
    30,
    true,
    true,
    ARRAY['/images/products/action-hero-1.jpg', '/images/products/action-hero-2.jpg']
  ),
  (
    'Ganesha Sculpture',
    'Beautiful hand-finished Ganesha sculpture. A spiritual addition to your home or office.',
    1899.00,
    'gods-sculpture',
    'Premium PLA',
    25,
    true,
    true,
    ARRAY['/images/products/ganesha-1.jpg', '/images/products/ganesha-2.jpg']
  ),
  (
    'Wall Mount Shelf',
    'Minimalist floating shelf design. Holds up to 2kg of decorative items.',
    749.00,
    'home-decor',
    'Premium PLA',
    40,
    false,
    false,
    ARRAY['/images/products/shelf-1.jpg']
  ),
  (
    'Pen Holder Set',
    'Set of 3 matching pen holders in different sizes. Perfect for organizing your workspace.',
    449.00,
    'table-top',
    'Premium PLA',
    60,
    false,
    false,
    ARRAY['/images/products/pen-holder-1.jpg']
  ),
  (
    'Dragon Figure',
    'Majestic dragon figure with intricate scale details. A stunning display piece.',
    2499.00,
    'action-figure',
    'Premium PLA',
    15,
    false,
    true,
    ARRAY['/images/products/dragon-1.jpg', '/images/products/dragon-2.jpg']
  ),
  (
    'Buddha Statue',
    'Serene Buddha statue in meditation pose. Brings peace and tranquility to any space.',
    1699.00,
    'gods-sculpture',
    'Premium PLA',
    20,
    false,
    false,
    ARRAY['/images/products/buddha-1.jpg']
  )
ON CONFLICT DO NOTHING;

-- Set some products as customizable
UPDATE public.products 
SET is_customizable = true 
WHERE category IN ('home-decor', 'table-top');

-- Add discount for Christmas offers
UPDATE public.products 
SET discount_percentage = 20 
WHERE is_trending = true;
