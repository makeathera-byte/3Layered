import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_OFFERS: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('home_content')
      .select('*')
      .eq('content_type', 'offers')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching offers:', error);
    }

    const offers = data?.content ? JSON.parse(data.content) : DEFAULT_OFFERS;

    return NextResponse.json({ offers });
  } catch (error: any) {
    console.error('Get offers error:', error);
    return NextResponse.json({ offers: DEFAULT_OFFERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offers } = await request.json();

    if (!offers || !Array.isArray(offers)) {
      return NextResponse.json({ error: 'Invalid offers data' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('home_content')
      .upsert({
        content_type: 'offers',
        content: JSON.stringify(offers),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'content_type'
      });

    if (error) {
      console.error('Error saving offers:', error);
      return NextResponse.json({ error: 'Failed to save offers' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Offers saved successfully' });
  } catch (error: any) {
    console.error('Save offers error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

