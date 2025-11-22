import { NextRequest, NextResponse } from 'next/server';

// API endpoint to serve Home Decor image
export async function GET(request: NextRequest) {
  // JPG image from Supabase Storage
  const imageUrl = 'https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/mandir_3.jpg';
  
  // Redirect to the JPG image
  return NextResponse.redirect(imageUrl, { status: 302 });
}

