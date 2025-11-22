import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_ARRIVALS = [
  { id: 1, title: "New Arrival 1", imageUrl: null },
  { id: 2, title: "New Arrival 2", imageUrl: null },
  { id: 3, title: "New Arrival 3", imageUrl: null },
  { id: 4, title: "New Arrival 4", imageUrl: null },
];

export async function GET(request: NextRequest) {
  try {
    // Get arrivals from database or return defaults
    const { data, error } = await supabaseAdmin
      .from('home_content')
      .select('*')
      .eq('content_type', 'arrivals')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching arrivals:', error);
    }

    // content is already JSONB, no need to parse if it's an object
    let arrivals = DEFAULT_ARRIVALS;
    if (data?.content) {
      try {
        arrivals = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        // Ensure no empty strings in imageUrl - convert to null
        arrivals = arrivals.map((arrival: any) => ({
          ...arrival,
          imageUrl: arrival.imageUrl && arrival.imageUrl.trim() !== "" ? arrival.imageUrl : null
        }));
      } catch {
        arrivals = DEFAULT_ARRIVALS;
      }
    }

    return NextResponse.json({ arrivals });
  } catch (error: any) {
    console.error('Get arrivals error:', error);
    return NextResponse.json({ arrivals: DEFAULT_ARRIVALS });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { arrivals } = await request.json();

    if (!arrivals || !Array.isArray(arrivals)) {
      return NextResponse.json({ error: 'Invalid arrivals data' }, { status: 400 });
    }

    // Clean up empty strings in imageUrl - convert to null
    const cleanedArrivals = arrivals.map((arrival: any) => ({
      ...arrival,
      imageUrl: arrival.imageUrl && arrival.imageUrl.trim() !== "" ? arrival.imageUrl : null
    }));

    // Upsert arrivals in database (content is JSONB, so pass as object)
    const { error } = await supabaseAdmin
      .from('home_content')
      .upsert({
        content_type: 'arrivals',
        content: cleanedArrivals, // JSONB accepts objects directly
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'content_type'
      });

    if (error) {
      console.error('Error saving arrivals:', error);
      return NextResponse.json({ error: 'Failed to save arrivals' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Arrivals saved successfully' });
  } catch (error: any) {
    console.error('Save arrivals error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

