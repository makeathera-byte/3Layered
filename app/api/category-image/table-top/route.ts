import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// API endpoint to serve Table Top image
// Fetches from database, falls back to default if not found
export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database first
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'category_images')
      .single();

    if (!error && data?.value) {
      const categoryImages = data.value as Record<string, string>;
      const imageUrl = categoryImages['table-top'];
      
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        return NextResponse.redirect(imageUrl, { status: 302 });
      }
    }
  } catch (dbError) {
    console.error('Error fetching category image from database:', dbError);
    // Fall through to default
  }
  
  // Fallback: Default JPG image from Supabase Storage
  const imageUrl = 'https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg';
  
  // Redirect to the JPG image
  return NextResponse.redirect(imageUrl, { status: 302 });
}

