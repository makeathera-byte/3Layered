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

// GET - List all media files
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'image' or 'video'
    const category = searchParams.get('category'); // Optional category filter

    // Check if media table exists first
    let query = supabaseAdmin
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching media:', error);
      
      // Check if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          { 
            error: 'Media table not found',
            details: 'The "media" table does not exist in your database.',
            instructions: 'Run the SQL in CREATE_MEDIA_TABLE.sql file in your Supabase SQL Editor to create the table.',
            sqlFile: 'CREATE_MEDIA_TABLE.sql'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data || [] });
  } catch (error: any) {
    console.error('Error in GET /api/admin/media:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 });
  }
}

// POST - Create new media entry
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, type, title, description, category, alt_text, thumbnail_url, file_size, duration } = body;

    // Validation
    if (!url || !type) {
      return NextResponse.json(
        { error: 'URL and type are required' },
        { status: 400 }
      );
    }

    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "image" or "video"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('media')
      .insert({
        url,
        type,
        title: title || null,
        description: description || null,
        category: category || null,
        alt_text: alt_text || null,
        thumbnail_url: thumbnail_url || null,
        file_size: file_size || null,
        duration: duration || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update media entry
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, url, title, description, category, alt_text, thumbnail_url, file_size, duration } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (url !== undefined) updates.url = url;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (alt_text !== undefined) updates.alt_text = alt_text;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (file_size !== undefined) updates.file_size = file_size;
    if (duration !== undefined) updates.duration = duration;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('media')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete media entry and file from storage
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // First, get the media entry to find the file path
    const { data: mediaItem, error: fetchError } = await supabaseAdmin
      .from('media')
      .select('url, type')
      .eq('id', id)
      .single();

    if (fetchError || !mediaItem) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Extract file path from URL
    // Supabase storage URLs format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = mediaItem.url.split('/');
    const bucketIndex = urlParts.indexOf('public') + 1;
    if (bucketIndex > 0 && bucketIndex < urlParts.length) {
      const bucket = urlParts[bucketIndex];
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      // Delete file from storage
      const { error: storageError } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting media from database:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/media:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

