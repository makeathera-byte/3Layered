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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hero } = await request.json();

    if (!hero) {
      return NextResponse.json({ error: 'Invalid hero data' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('home_content')
      .upsert({
        content_type: 'hero',
        content: hero, // JSONB accepts objects directly
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'content_type'
      });

    if (error) {
      console.error('Error saving hero:', error);
      return NextResponse.json({ error: 'Failed to save hero' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Hero section saved successfully' });
  } catch (error: any) {
    console.error('Save hero error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

