import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Public API endpoint to get all category images
// This is used by the frontend to display category images
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'category_images')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching category images:', error);
    }

    // Default category images if not found in database
    const defaultCategoryImages: Record<string, string> = {
      "home-decor": "/api/category-image/home-decor",
      "table-top": "/api/category-image/table-top",
      "gods-sculpture": "/api/category-image/gods-sculpture",
    };

    const categoryImages = data?.value || defaultCategoryImages;

    // Remove action-figure if it exists
    if (categoryImages && typeof categoryImages === 'object' && 'action-figure' in categoryImages) {
      delete (categoryImages as any)['action-figure'];
    }

    return NextResponse.json({ categoryImages });
  } catch (error: any) {
    console.error('Get category images error:', error);
    // Return defaults on error
    return NextResponse.json({
      categoryImages: {
        "home-decor": "/api/category-image/home-decor",
        "table-top": "/api/category-image/table-top",
        "gods-sculpture": "/api/category-image/gods-sculpture",
      }
    });
  }
}

