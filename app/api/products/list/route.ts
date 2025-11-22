import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const category = searchParams.get('category');
    const trending = searchParams.get('trending') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const customizable = searchParams.get('customizable') === 'true';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Build query
    let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

    // Filter by deletion status
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category.toLowerCase());
    }

    // Filter by trending
    if (trending) {
      query = query.eq('is_trending', true);
    }

    // Filter by featured
    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Filter by customizable
    if (customizable) {
      query = query.eq('is_customizable', true);
    }

    // Search by title or description
    if (search && search.trim() !== '') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        query = query.gte('price', min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        query = query.lte('price', max);
      }
    }

    // Validate sort field
    const validSortFields = [
      'created_at', 
      'updated_at', 
      'title', 
      'price', 
      'inventory', 
      'category'
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    // Apply sorting
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch products: ${error.message}` },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalProducts = count || 0;
    const hasMore = limit ? offset + limit < totalProducts : false;

    return NextResponse.json(
      {
        success: true,
        products: data || [],
        pagination: {
          total: totalProducts,
          offset,
          limit: limit || totalProducts,
          hasMore,
          page: limit ? Math.floor(offset / limit) + 1 : 1,
          totalPages: limit ? Math.ceil(totalProducts / limit) : 1,
        },
        filters: {
          category,
          trending,
          featured,
          customizable,
          includeDeleted,
          search,
          minPrice,
          maxPrice,
          sortBy: sortField,
          sortOrder,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error listing products:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

