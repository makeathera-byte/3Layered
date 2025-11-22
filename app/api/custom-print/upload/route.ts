import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST - Upload file for custom print order
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file extension for naming
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    
    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of 500MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `custom-prints/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine MIME type - use file's MIME type if available, otherwise default
    let contentType = file.type || 'application/octet-stream';
    
    // If browser didn't provide MIME type, try to detect from extension
    if (!file.type || file.type === 'application/octet-stream') {
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'stl': 'application/octet-stream',
        'obj': 'text/plain',
        'glb': 'model/gltf-binary',
        'gltf': 'model/gltf+json',
        '3mf': 'model/3mf',
        'ply': 'text/plain',
        'fbx': 'application/octet-stream'
      };
      contentType = mimeTypes[fileExt] || 'application/octet-stream';
    }

    // Check if bucket exists, create if it doesn't
    const bucketName = 'custom-prints';
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (!listError && buckets) {
      const bucketExists = buckets.some(b => b.name === bucketName);
      if (!bucketExists) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: false, // Private bucket for custom prints
          fileSizeLimit: 524288000, // 500MB
          allowedMimeTypes: ['*'] // Allow all MIME types
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return NextResponse.json(
            {
              error: `Storage bucket "${bucketName}" not found. Please create it in Supabase Dashboard > Storage.`,
              details: createError.message,
              bucketName: bucketName
            },
            { status: 500 }
          );
        }
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: contentType,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);

      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        return NextResponse.json(
          {
            error: `Storage bucket "${bucketName}" not found. Please create it in Supabase Dashboard > Storage.`,
            bucketName: bucketName,
            instructions: `Create a private bucket named "${bucketName}" in your Supabase project.`
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get signed URL (valid for 1 hour) for private files
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (urlError) {
      // If signed URL fails, try public URL (fallback)
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return NextResponse.json({
        success: true,
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_path: filePath,
      });
    }

    // Determine file type from extension and MIME type
    const fileTypeMap: Record<string, string> = {
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'webp': 'image', 'heic': 'image', 'heif': 'image', 'bmp': 'image', 'svg': 'image',
      'mp4': 'video', 'webm': 'video', 'mov': 'video', 'avi': 'video', 'mkv': 'video',
      'stl': '3d_model', 'obj': '3d_model', 'glb': '3d_model', 'gltf': '3d_model',
      '3mf': '3d_model', 'ply': '3d_model', 'fbx': '3d_model', 'dae': '3d_model',
      'pdf': 'document', 'doc': 'document', 'docx': 'document',
      'xls': 'document', 'xlsx': 'document', 'txt': 'document'
    };
    const detectedFileType = fileTypeMap[fileExt] || 'other';

    // Try to save file metadata to custom_print_files table (optional - won't fail if table doesn't exist)
    try {
      const { error: fileRecordError } = await supabaseAdmin
        .from('custom_print_files')
        .insert({
          file_url: urlData.signedUrl,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: detectedFileType,
          mime_type: contentType,
          file_extension: fileExt,
          bucket_name: bucketName,
          status: 'uploaded',
          uploaded_by: 'user',
          created_at: new Date().toISOString(),
        });

      if (fileRecordError) {
        // Log but don't fail - file is already uploaded to storage
        console.warn('Could not save file metadata to database:', fileRecordError.message);
      }
    } catch (dbError: any) {
      // Table might not exist yet - that's okay, file is still uploaded
      console.warn('File metadata table may not exist:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      file_url: urlData.signedUrl,
      file_name: file.name,
      file_size: file.size,
      file_path: filePath,
      file_type: detectedFileType,
      mime_type: contentType,
    });
  } catch (error: any) {
    console.error('Error in POST /api/custom-print/upload:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

