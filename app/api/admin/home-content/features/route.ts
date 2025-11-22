import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_FEATURES = [
  { id: 1, title: "Materials We Use", description: "PLA+, Premium PET-G, and Durable ABS." },
  { id: 2, title: "Functional & Artistic", description: "Desk lamps, mobile stands, sculptures." },
  { id: 3, title: "Custom Prototypes", description: "Fast iteration with precise dimensions." },
];

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { features } = await request.json();

    if (!features || !Array.isArray(features)) {
      return NextResponse.json({ error: 'Invalid features data' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('home_content')
      .upsert({
        content_type: 'features',
        content: features, // JSONB accepts objects directly
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'content_type'
      });

    if (error) {
      console.error('Error saving features:', error);
      return NextResponse.json({ error: 'Failed to save features' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Features saved successfully' });
  } catch (error: any) {
    console.error('Save features error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

