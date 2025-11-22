import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const sessionData = JSON.parse(token);
    
    if (Date.now() > sessionData.expiresAt) return null;
    
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', sessionData.email)
      .eq('role', 'admin')
      .single();
    
    return user;
  } catch {
    return null;
  }
}

// GET - Get settings
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', 'store_settings')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
    }

    const defaultSettings = {
      storeName: "3 Layered",
      storeEmail: "3layerd.in@gmail.com",
      storePhone: "+91 9982781000",
      storeAddress: "Pune, Maharashtra, India",
      currency: "INR",
      taxRate: "18",
    };

    const settings = data?.value ? JSON.parse(data.value) : defaultSettings;

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json({ 
      settings: {
        storeName: "3 Layered",
        storeEmail: "3layerd.in@gmail.com",
        storePhone: "+91 9982781000",
        storeAddress: "Pune, Maharashtra, India",
        currency: "INR",
        taxRate: "18",
      }
    });
  }
}

// POST - Save settings
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await request.json();

    if (!settings) {
      return NextResponse.json({ error: 'Settings data required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({
        key: 'store_settings',
        value: JSON.stringify(settings),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error saving settings:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

