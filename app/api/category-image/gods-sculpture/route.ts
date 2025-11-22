import { NextRequest, NextResponse } from 'next/server';

// API endpoint to serve God's Sculpture image
// Note: HEIC files are not supported by browsers, so this redirects to the Supabase URL
// Best solution: Convert HEIC to JPG/PNG and update the URL in the component
export async function GET(request: NextRequest) {
  // Redirect to the Supabase image URL
  // If browser doesn't support HEIC, it will show a broken image
  // Solution: Convert HEIC to JPG/PNG and update the URL
  // JPG image from Supabase Storage
  const imageUrl = 'https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/Ram%20lallas.jpg';
  
  // Redirect to the JPG image
  return NextResponse.redirect(imageUrl, { status: 302 });
}

