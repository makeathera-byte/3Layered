import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_FEATURES = [
  { id: 1, title: "Materials We Use", description: "PLA+, Premium PET-G, and Durable ABS." },
  { id: 2, title: "Functional & Artistic", description: "Desk lamps, mobile stands, sculptures." },
  { id: 3, title: "Custom Prototypes", description: "Fast iteration with precise dimensions." },
];

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('home_content')
      .select('*')
      .eq('content_type', 'features')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching features:', error);
    }

    let features = DEFAULT_FEATURES;
    if (data?.content) {
      try {
        features = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      } catch {
        features = DEFAULT_FEATURES;
      }
    }

    return NextResponse.json({ features });
  } catch (error: any) {
    console.error('Get features error:', error);
    return NextResponse.json({ features: DEFAULT_FEATURES });
  }
}

