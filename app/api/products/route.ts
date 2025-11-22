// GET /api/products - List all products
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const trending = searchParams.get('trending') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (trending) {
      query = query.eq('is_trending', true);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

