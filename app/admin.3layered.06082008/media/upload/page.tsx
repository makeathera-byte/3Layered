"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminMediaAPI } from "@/lib/admin-api";

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string | null;
  description: string | null;
  category: string | null;
  alt_text: string | null;
  thumbnail_url: string | null;
  file_size: number | null;
  duration: number | null;
  created_at: string;
  updated_at: string | null;
}

export default function MediaUpload() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'image' as 'image' | 'video',
    files: [] as File[],
    category: '',
    title: '',
    description: '',
    alt_text: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadExistingMedia();
    }
  }, [router, mounted, filterType]);

  const loadExistingMedia = async () => {
    try {
      setLoadingMedia(true);
      const type = filterType === 'all' ? undefined : filterType;
      const data = await adminMediaAPI.getAll(type);
      setExistingMedia(data.media || []);
    } catch (error: any) {
      console.error("Error loading media:", error);
      // Show user-friendly error message
      if (error.message?.includes('not found') || error.message?.includes('table')) {
        alert('Media table not found. Please create it first by running CREATE_MEDIA_TABLE.sql in Supabase SQL Editor.');
      } else {
        alert(`Failed to load media: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => {
        if (formData.type === 'image') {
          return file.type.startsWith('image/');
        } else {
          return file.type.startsWith('video/');
        }
      });
      setFormData({ ...formData, files: [...formData.files, ...validFiles] });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, files: [...formData.files, ...files] });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData({ ...formData, files: newFiles });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return;
    }

    try {
      await adminMediaAPI.delete(id);
      await loadExistingMedia();
      alert('Media deleted successfully!');
    } catch (error: any) {
      console.error("Error deleting media:", error);
      alert(`Failed to delete: ${error.message || "Unknown error"}`);
    }
  };

  const handleUpload = async () => {
    if (formData.files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadedFiles([]);

      const totalFiles = formData.files.length;
      const uploaded: any[] = [];

      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));

        try {
          const result = await adminMediaAPI.upload(
            file,
            formData.type,
            {
              category: formData.category || undefined,
              title: formData.title || file.name,
              description: formData.description || undefined,
              alt_text: formData.alt_text || undefined,
            }
          );
          uploaded.push(result.media);
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      setUploadedFiles(uploaded);
      
      if (uploaded.length > 0) {
        alert(`Successfully uploaded ${uploaded.length} file(s)!`);
        // Reset form
        setFormData({
          type: 'image',
          files: [],
          category: '',
          title: '',
          description: '',
          alt_text: '',
        });
        // Reload existing media
        await loadExistingMedia();
      }
    } catch (error: any) {
      console.error("Error uploading files:", error);
      alert(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!mounted || !isAuthorized) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-800">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Upload Media</h1>
            <p className="text-gray-800 mt-2">Upload images and videos to your website</p>
          </div>
          <button
            onClick={() => router.push("/admin.3layered.06082008/media")}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Library
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Media Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: 'image', files: [] });
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'image'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">🖼️</span>
                <span className="font-medium">Images</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: 'video', files: [] });
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'video'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">🎥</span>
                <span className="font-medium">Videos</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                accept={formData.type === 'image' 
                  ? 'image/*,.heic,.heif' 
                  : 'video/*'}
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-gray-800 font-medium mb-1">
                  Click to select or drag and drop
                </p>
                <p className="text-sm text-gray-700">
                  {formData.type === 'image' 
                    ? 'PNG, JPG, GIF, WEBP, HEIC up to 10MB'
                    : 'MP4, WEBM, MOV up to 100MB'}
                </p>
              </label>
            </div>
          </div>

          {/* Selected Files Preview */}
          {formData.files.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Files ({formData.files.length})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {formData.type === 'image' ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-2xl">🎥</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-700">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., hero, gallery, banner, product"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter title (will use filename if not provided)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                placeholder="Enter description"
              />
            </div>

            {formData.type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text (optional)
                </label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter alt text for accessibility"
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-800">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || formData.files.length === 0}
            className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? `Uploading... ${uploadProgress}%` : `Upload ${formData.files.length} File(s)`}
          </button>
        </div>

        {/* Uploaded Files Success Message */}
        {uploadedFiles.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              ✅ Successfully Uploaded {uploadedFiles.length} File(s)
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.alt_text || file.title || 'Uploaded'}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {file.title || 'Untitled'}
                    </p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => router.push("/admin.3layered.06082008/media")}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                View in Library
              </button>
              <button
                onClick={() => setUploadedFiles([])}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload More
              </button>
            </div>
          </div>
        )}

        {/* Existing Media Library */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Uploaded Media</h2>
              <p className="text-gray-800 mt-1">Manage your uploaded images and videos</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
              >
                <option value="all">All Types</option>
                <option value="image">Images Only</option>
                <option value="video">Videos Only</option>
              </select>
              <button
                onClick={() => router.push("/admin.3layered.06082008/media")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Full Library
              </button>
            </div>
          </div>

          {loadingMedia ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : existingMedia.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-800">No media files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.alt_text || item.title || 'Media'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(item.url, item.id)}
                          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-md"
                          title="Copy URL"
                        >
                          {copiedId === item.id ? (
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 truncate mb-1">
                      {item.title || 'Untitled'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span>
                        {item.type === 'image' ? '🖼️' : '🎥'} {item.type}
                      </span>
                      {item.file_size && (
                        <span>{formatFileSize(item.file_size)}</span>
                      )}
                    </div>
                    {item.category && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        {item.category}
                      </span>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => copyToClipboard(item.url, item.id)}
                        className="flex-1 px-2 py-1.5 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                      >
                        {copiedId === item.id ? '✓ Copied' : 'Copy URL'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Upload Tips</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• You can upload multiple files at once</li>
            <li>• Drag and drop files directly onto the upload area</li>
            <li>• Images: PNG, JPG, GIF, WEBP (max 10MB each)</li>
            <li>• Videos: MP4, WEBM, MOV (max 100MB each)</li>
            <li>• Use categories to organize your media</li>
            <li>• Alt text helps with SEO and accessibility</li>
            <li>• Click "Copy URL" to get the direct link to your media</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

