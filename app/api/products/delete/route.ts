import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET handler for browser access
export async function GET() {
  return NextResponse.json({
    error: 'This endpoint requires a DELETE request',
    message: 'Cannot use browser address bar for deleting products',
    usage: {
      method: 'DELETE',
      endpoint: '/api/products/delete?id=PRODUCT_ID',
      query_params: {
        id: 'Required - Product UUID',
        permanent: 'Optional - Set to "true" for permanent deletion (default: soft delete)'
      },
      examples: {
        soft_delete: 'DELETE /api/products/delete?id=550e8400-e29b-41d4-a716-446655440000',
        permanent_delete: 'DELETE /api/products/delete?id=550e8400-e29b-41d4-a716-446655440000&permanent=true',
        restore: 'PATCH /api/products/delete?id=550e8400-e29b-41d4-a716-446655440000'
      }
    },
    documentation: 'See /API_DOCUMENTATION.md for full details'
  }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    // Validate product ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Product ID is required for deletion' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, title, deleted_at')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already soft-deleted
    if (existingProduct.deleted_at && !permanent) {
      return NextResponse.json(
        { error: 'Product is already deleted (soft delete)' },
        { status: 400 }
      );
    }

    if (permanent) {
      // Permanent deletion - actually remove from database
      const { error: deleteError } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Supabase error:', deleteError);
        return NextResponse.json(
          { error: `Failed to permanently delete product: ${deleteError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Product permanently deleted',
          product_id: id,
          product_title: existingProduct.title,
        },
        { status: 200 }
      );
    } else {
      // Soft delete - set deleted_at timestamp
      const { data, error: updateError } = await supabaseAdmin
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase error:', updateError);
        return NextResponse.json(
          { error: `Failed to delete product: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Product deleted successfully (soft delete)',
          product: data,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Restore a soft-deleted product
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate product ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Product ID is required for restoration' },
        { status: 400 }
      );
    }

    // Check if product exists and is soft-deleted
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, title, deleted_at')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!existingProduct.deleted_at) {
      return NextResponse.json(
        { error: 'Product is not deleted' },
        { status: 400 }
      );
    }

    // Restore product by setting deleted_at to null
    const { data, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json(
        { error: `Failed to restore product: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product restored successfully',
        product: data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error restoring product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

