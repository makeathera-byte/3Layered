import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_HERO = {
  title: "You dream it we 3D it",
  description: "3Layered is a modern 3D printing studio that transforms imagination into tangible creations. From functional products like desk lamps and mobile stands to artistic pieces and custom prototypes, we craft high-quality, precise, and beautifully finished prints. Every product is built layer by layer — merging creativity, technology, and craftsmanship to bring your ideas to life. We print in PLA+, Premium PET-G, and Durable ABS.",
  primaryButtonText: "Start a Custom Print",
  primaryButtonLink: "/custom-print",
  secondaryButtonText: "Browse Products",
  secondaryButtonLink: "/products",
};

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('home_content')
      .select('*')
      .eq('content_type', 'hero')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching hero:', error);
    }

    let hero = DEFAULT_HERO;
    if (data?.content) {
      try {
        hero = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      } catch {
        hero = DEFAULT_HERO;
      }
    }

    return NextResponse.json({ hero });
  } catch (error: any) {
    console.error('Get hero error:', error);
    return NextResponse.json({ hero: DEFAULT_HERO });
  }
}

