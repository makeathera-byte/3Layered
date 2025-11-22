import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_ARRIVALS = [
  { id: 1, title: "New Arrival 1", imageUrl: null, productId: null, price: 0, discountPercentage: 0, discountedPrice: 0 },
  { id: 2, title: "New Arrival 2", imageUrl: null, productId: null, price: 0, discountPercentage: 0, discountedPrice: 0 },
  { id: 3, title: "New Arrival 3", imageUrl: null, productId: null, price: 0, discountPercentage: 0, discountedPrice: 0 },
  { id: 4, title: "New Arrival 4", imageUrl: null, productId: null, price: 0, discountPercentage: 0, discountedPrice: 0 },
];

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    // First, try to get products with new_arrival_position set
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, images, price, discount_percentage, new_arrival_position')
      .not('new_arrival_position', 'is', null)
      .is('deleted_at', null)
      .order('new_arrival_position', { ascending: true });

    if (productsError) {
      console.error('Error fetching products for new arrivals:', productsError);
    }

    // Create arrivals array from products
    let arrivals = [...DEFAULT_ARRIVALS];
    
    if (products && products.length > 0) {
      // Map products to arrivals based on their position
      products.forEach((product: any) => {
        const position = product.new_arrival_position;
        if (position >= 1 && position <= 4) {
          const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
          const discountedPrice = product.discount_percentage 
            ? Math.round(product.price * (1 - product.discount_percentage / 100))
            : product.price;
          
          arrivals[position - 1] = {
            id: position,
            title: product.title,
            imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl : null,
            productId: product.id,
            price: product.price,
            discountPercentage: product.discount_percentage || 0,
            discountedPrice: discountedPrice
          };
        }
      });
    } else {
      // Fallback to home_content table if no products with new_arrival_position
      const { data, error } = await supabaseAdmin
        .from('home_content')
        .select('*')
        .eq('content_type', 'arrivals')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching arrivals:', error);
      }

      if (data?.content) {
        try {
          const contentArrivals = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          // Ensure no empty strings in imageUrl - convert to null
          arrivals = contentArrivals.map((arrival: any) => ({
            ...arrival,
            imageUrl: arrival.imageUrl && arrival.imageUrl.trim() !== "" ? arrival.imageUrl : null,
            productId: arrival.productId || null
          }));
        } catch {
          // Keep default arrivals
        }
      }
    }

    return NextResponse.json({ arrivals });
  } catch (error: any) {
    console.error('Get arrivals error:', error);
    return NextResponse.json({ arrivals: DEFAULT_ARRIVALS });
  }
}

