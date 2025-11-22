import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET handler for browser access
export async function GET() {
  return NextResponse.json({
    error: 'This endpoint requires a PUT request',
    message: 'Cannot use browser address bar for updating products',
    usage: {
      method: 'PUT',
      endpoint: '/api/products/update',
      required_fields: ['id'],
      optional_fields: ['title', 'price', 'category', 'inventory', 'description', 'images', 'is_trending', 'is_featured', 'etc'],
      example: {
        id: 'PRODUCT_UUID',
        price: 1500,
        is_trending: true
      }
    },
    documentation: 'See /API_DOCUMENTATION.md for full details'
  }, { status: 405 });
}

interface ProductUpdateData {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  inventory?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  is_customizable?: boolean;
  is_trending?: boolean;
  is_featured?: boolean;
  discount_percentage?: number;
  material?: string;
  tags?: string[];
}

export async function PUT(request: NextRequest) {
  try {
    const body: ProductUpdateData = await request.json();

    // Validate product ID
    if (!body.id || body.id.trim() === '') {
      return NextResponse.json(
        { error: 'Product ID is required for update' },
        { status: 400 }
      );
    }

    // Check if product exists and is not deleted
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, deleted_at')
      .eq('id', body.id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.deleted_at) {
      return NextResponse.json(
        { error: 'Cannot update a deleted product' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (body.title !== undefined) {
      if (body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Product title cannot be empty' },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description.trim();
    }

    if (body.price !== undefined) {
      if (body.price <= 0) {
        return NextResponse.json(
          { error: 'Price must be greater than 0' },
          { status: 400 }
        );
      }
      updates.price = Number(body.price);
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          { error: 'Images must be an array of URLs' },
          { status: 400 }
        );
      }
      updates.images = body.images;
    }

    if (body.category !== undefined) {
      const validCategoryFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (!validCategoryFormat.test(body.category)) {
        return NextResponse.json(
          { error: 'Category must be lowercase with hyphens (e.g., "home-decor")' },
          { status: 400 }
        );
      }
      updates.category = body.category.toLowerCase().trim();
    }

    if (body.inventory !== undefined) {
      if (body.inventory < 0) {
        return NextResponse.json(
          { error: 'Inventory cannot be negative' },
          { status: 400 }
        );
      }
      updates.inventory = Number(body.inventory);
    }

    if (body.is_customizable !== undefined) {
      updates.is_customizable = Boolean(body.is_customizable);
    }

    if (body.is_trending !== undefined) {
      updates.is_trending = Boolean(body.is_trending);
    }

    if (body.is_featured !== undefined) {
      updates.is_featured = Boolean(body.is_featured);
    }

    if (body.discount_percentage !== undefined) {
      if (body.discount_percentage < 0 || body.discount_percentage > 100) {
        return NextResponse.json(
          { error: 'Discount percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
      updates.discount_percentage = Number(body.discount_percentage);
    }

    if (body.material !== undefined) {
      updates.material = body.material.trim();
    }

    if (body.dimensions !== undefined) {
      if (body.dimensions && typeof body.dimensions !== 'object') {
        return NextResponse.json(
          { error: 'Dimensions must be an object' },
          { status: 400 }
        );
      }
      updates.dimensions = body.dimensions;
    }
    
    // If no updates, return early
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No updates provided' });
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json(
          { error: 'Tags must be an array of strings' },
          { status: 400 }
        );
      }
      updates.tags = body.tags;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Update product in Supabase
    let { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    // If error is about dimensions column, retry without it
    if (error && error.message?.includes('dimensions') && error.message?.includes('schema cache')) {
      console.warn('Dimensions column not found, retrying without dimensions...');
      
      // Remove dimensions from updates and try again
      const { dimensions, ...updatesWithoutDimensions } = updates;
      const retryResult = await supabaseAdmin
        .from('products')
        .update(updatesWithoutDimensions)
        .eq('id', body.id)
        .select()
        .single();
      
      data = retryResult.data;
      error = retryResult.error;
      
      if (!error) {
        console.warn('Product updated without dimensions. Run FIX_PRODUCTS_DIMENSIONS.sql to add the column.');
      }
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to update product: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        product: data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

