import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Default category images from Supabase Storage
// This route serves as a fallback when no specific category image is found
const DEFAULT_CATEGORY_IMAGES = [
  'https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg',
  'https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/mandir_3.jpg',
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    
    // Fallback: use index parameter or default images
    const indexParam = url.searchParams.get("index") ?? "0";
    let index = Number.parseInt(indexParam, 10);
    if (!Number.isFinite(index) || index < 0) index = 0;

    // Use default images from Supabase Storage
    const imageUrl = DEFAULT_CATEGORY_IMAGES[Math.min(index, DEFAULT_CATEGORY_IMAGES.length - 1)] || DEFAULT_CATEGORY_IMAGES[0];
    
    // Redirect to the image URL
    return NextResponse.redirect(imageUrl, { status: 302 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Unable to load image", detail: errorMessage },
      { status: 500 }
    );
  }
}

