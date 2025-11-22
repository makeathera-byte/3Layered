import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Helper to verify admin from session
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const sessionData = JSON.parse(token);
    
    // Verify session hasn't expired
    if (Date.now() > sessionData.expiresAt) return null;
    
    // Verify user is admin
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

// GET - List all products for admin
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      images,
      category,
      material,
      inventory,
      is_customizable,
      is_trending,
      is_featured,
      discount_percentage,
      tags
    } = body;

    // Validation
    if (!title || !price || !category) {
      return NextResponse.json(
        { error: 'Title, price, and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        description,
        price: parseFloat(price),
        images: images || [],
        category,
        material,
        inventory: parseInt(inventory) || 0,
        is_customizable: is_customizable || false,
        is_trending: is_trending || false,
        is_featured: is_featured || false,
        discount_percentage: parseInt(discount_percentage) || 0,
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.inventory !== undefined) updates.inventory = parseInt(updates.inventory);
    if (updates.discount_percentage !== undefined) {
      updates.discount_percentage = parseInt(updates.discount_percentage);
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Soft delete product
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

