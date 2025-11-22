// Cart API routes
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cart')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cart: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, product_id, quantity, customization_note, customization_image } = body;

    if (!user_id || !product_id) {
      return NextResponse.json(
        { error: 'User ID and Product ID required' },
        { status: 400 }
      );
    }

    // Check if item already exists
    const { data: existing } = await supabaseAdmin
      .from('cart')
      .select('*')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabaseAdmin
        .from('cart')
        .update({
          quantity: existing.quantity + (quantity || 1),
          customization_note: customization_note || existing.customization_note,
          customization_image: customization_image || existing.customization_image
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ cart_item: data });
    } else {
      // Insert new item
      const { data, error } = await supabaseAdmin
        .from('cart')
        .insert({
          user_id,
          product_id,
          quantity: quantity || 1,
          customization_note,
          customization_image
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ cart_item: data }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, quantity, customization_note, customization_image } = body;

    if (!id) {
      return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 });
    }

    const updates: any = {};
    if (quantity !== undefined) updates.quantity = quantity;
    if (customization_note !== undefined) updates.customization_note = customization_note;
    if (customization_image !== undefined) updates.customization_image = customization_image;

    const { data, error } = await supabaseAdmin
      .from('cart')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cart_item: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll && userId) {
      // Clear entire cart
      const { error } = await supabaseAdmin
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Cart cleared' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

