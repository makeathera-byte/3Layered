import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Supabase error fetching product:', error);
      // Check if it's a "not found" error (PGRST116) or actual database error
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return NextResponse.json(
          { error: 'Product not found', details: `Product with ID ${id} does not exist or has been deleted` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch product', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Product not found', details: `No product found with ID ${id}` },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const product = {
      ...data,
      images: data.images ? (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) : [],
      dimensions: data.dimensions ? (typeof data.dimensions === 'string' ? JSON.parse(data.dimensions) : data.dimensions) : undefined,
    };

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
