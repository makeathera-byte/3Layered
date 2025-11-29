import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const sessionData = JSON.parse(token);
    
    if (Date.now() > sessionData.expiresAt) return null;
    
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', sessionData.email)
      .eq('role', 'admin')
      .single();
    
    return user;
  } catch {
    return null;
  }
}

// GET - Get category images
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', 'category_images')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching category images:', error);
    }

    const defaultCategoryImages = {
      "home-decor": "/api/category-image/home-decor",
      "table-top": "https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg",
      "gods-sculpture": "/api/category-image/gods-sculpture",
    };

    const categoryImages = data?.value || defaultCategoryImages;

    return NextResponse.json({ categoryImages });
  } catch (error: any) {
    console.error('Get category images error:', error);
    return NextResponse.json({ 
      categoryImages: {
        "home-decor": "/api/category-image/home-decor",
        "table-top": "https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg",
        "gods-sculpture": "/api/category-image/gods-sculpture",
      }
    });
  }
}

// POST - Update category images
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryImages } = await request.json();

    if (!categoryImages || typeof categoryImages !== 'object') {
      return NextResponse.json({ error: 'Category images data required' }, { status: 400 });
    }

    // Validate that all values are strings (URLs)
    for (const [key, value] of Object.entries(categoryImages)) {
      if (typeof value !== 'string' || value.trim() === '') {
        return NextResponse.json({ 
          error: `Invalid image URL for category "${key}". Must be a non-empty string.` 
        }, { status: 400 });
      }
    }

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({
        key: 'category_images',
        value: categoryImages,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error saving category images:', error);
      return NextResponse.json({ error: 'Failed to save category images' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category images saved successfully' });
  } catch (error: any) {
    console.error('Save category images error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

