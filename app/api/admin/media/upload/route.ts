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

// POST - Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'video'
    const category = formData.get('category') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const alt_text = formData.get('alt_text') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "image" or "video"' },
        { status: 400 }
      );
    }

    // Get file extension and detect actual type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = file.name;
    
    // List of supported image formats
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'];
    
    // Validate file extension
    if (type === 'image' && fileExt && !imageExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: `Unsupported image format: .${fileExt}. Supported formats: ${imageExtensions.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (type === 'video' && fileExt && !videoExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: `Unsupported video format: .${fileExt}. Supported formats: ${videoExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${type}s/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const bucket = type === 'image' ? 'website-images' : 'website-videos';
    
    // Determine correct MIME type based on extension if browser sent wrong type
    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      // Map file extensions to MIME types
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'flv': 'video/x-flv'
      };
      contentType = fileExt ? (mimeTypes[fileExt] || 'application/octet-stream') : 'application/octet-stream';
    }

    // Check if bucket exists, create if it doesn't
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (!listError && buckets) {
      const bucketExists = buckets.some(b => b.name === bucket);
      if (!bucketExists) {
        // Try to create the bucket with broader MIME type support
        const allowedMimeTypes = type === 'image' 
          ? ['image/*', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
          : ['video/*', 'video/mp4', 'video/webm', 'video/quicktime'];
        
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: type === 'image' ? 10485760 : 104857600, // 10MB for images, 100MB for videos
          allowedMimeTypes: allowedMimeTypes
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          return NextResponse.json(
            { 
              error: `Storage bucket "${bucket}" not found. Please create it in Supabase Dashboard > Storage.`,
              details: createError.message,
              bucketName: bucket
            },
            { status: 500 }
          );
        }
      }
    }
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: contentType,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      
      // Provide helpful error message for bucket not found
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        return NextResponse.json(
          { 
            error: `Storage bucket "${bucket}" not found. Please create it in Supabase Dashboard > Storage.`,
            bucketName: bucket,
            instructions: `Create a public bucket named "${bucket}" in your Supabase project.`
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Create media entry in database
    const { data: mediaData, error: mediaError } = await supabaseAdmin
      .from('media')
      .insert({
        url: publicUrl,
        type,
        title: title || file.name,
        description: description || null,
        category: category || null,
        alt_text: alt_text || null,
        file_size: file.size,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Error creating media entry:', mediaError);
      
      // Check if table doesn't exist
      if (mediaError.message?.includes('not found') || mediaError.message?.includes('schema cache')) {
        // Try to delete uploaded file
        await supabaseAdmin.storage.from(bucket).remove([filePath]);
        return NextResponse.json(
          { 
            error: 'Media table not found. Please create it first.',
            details: 'The "media" table does not exist in your database.',
            instructions: 'Run the SQL in CREATE_MEDIA_TABLE.sql file in your Supabase SQL Editor to create the table.',
            sqlFile: 'CREATE_MEDIA_TABLE.sql'
          },
          { status: 500 }
        );
      }
      
      // Try to delete uploaded file
      await supabaseAdmin.storage.from(bucket).remove([filePath]);
      return NextResponse.json(
        { error: `Failed to create media entry: ${mediaError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: mediaData,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/media/upload:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

