import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    // Get featured products (products with is_featured = true)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, images, price, discount_percentage')
      .eq('is_featured', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(4);

    if (productsError) {
      console.error('Error fetching featured products for special offers:', productsError);
      return NextResponse.json({ offers: [] });
    }

    // Map products to special offers format
    const offers = (products || []).map((product: any) => {
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
      const discountedPrice = product.discount_percentage 
        ? Math.round(product.price * (1 - product.discount_percentage / 100))
        : product.price;

      return {
        id: product.id,
        title: product.title,
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl : null,
        productId: product.id,
        price: product.price,
        discountPercentage: product.discount_percentage || 0,
        discountedPrice: discountedPrice
      };
    });

    return NextResponse.json({ offers });
  } catch (error: any) {
    console.error('Get special offers error:', error);
    return NextResponse.json({ offers: [] });
  }
}

