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

export default function AdminMedia() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: 'image' as 'image' | 'video',
    category: '',
    title: '',
    description: '',
    alt_text: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
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
      loadMedia();
    }
  }, [router, mounted, filterType, filterCategory]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const type = filterType === 'all' ? undefined : filterType;
      const category = filterCategory === 'all' ? undefined : filterCategory;
      const data = await adminMediaAPI.getAll(type, category);
      setMedia(data.media || []);
    } catch (error: any) {
      console.error("Error loading media:", error);
      // Show user-friendly error message
      if (error.message?.includes('not found') || error.message?.includes('table')) {
        alert('Media table not found. Please create it first by running CREATE_MEDIA_TABLE.sql in Supabase SQL Editor.');
      } else {
        alert(`Failed to load media: ${error.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      await adminMediaAPI.upload(
        uploadForm.file,
        uploadForm.type,
        {
          category: uploadForm.category || undefined,
          title: uploadForm.title || undefined,
          description: uploadForm.description || undefined,
          alt_text: uploadForm.alt_text || undefined,
        }
      );

      // Reset form
      setUploadForm({
        file: null,
        type: 'image',
        category: '',
        title: '',
        description: '',
        alt_text: '',
      });
      setShowUploadModal(false);
      await loadMedia();
      alert('File uploaded successfully!');
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      alt_text: item.alt_text || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingMedia) return;

    try {
      await adminMediaAPI.update(editingMedia.id, editForm);
      setShowEditModal(false);
      setEditingMedia(null);
      await loadMedia();
      alert('Media updated successfully!');
    } catch (error: any) {
      console.error("Error updating media:", error);
      alert(`Failed to update: ${error.message || "Unknown error"}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await adminMediaAPI.delete(id);
      await loadMedia();
      alert('Media deleted successfully!');
    } catch (error: any) {
      console.error("Error deleting media:", error);
      alert(`Failed to delete: ${error.message || "Unknown error"}`);
    }
  };

  const getCategories = () => {
    const categories = new Set<string>();
    media.forEach(item => {
      if (item.category) categories.add(item.category);
    });
    return Array.from(categories).sort();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Media Library</h1>
            <p className="text-gray-800 mt-2">Manage website images and videos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin.3layered.06082008/media/upload")}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              + Upload Media
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
          >
            <option value="all">All Categories</option>
            {getCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse aspect-square"></div>
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-800 text-lg">No media files yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-square relative bg-gray-100">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.title || 'Media'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    {item.type === 'image' ? '🖼️ Image' : '🎥 Video'}
                    {item.file_size && ` • ${formatFileSize(item.file_size)}`}
                  </p>
                  {item.category && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Media</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as 'image' | 'video' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                  <input
                    type="file"
                    accept={uploadForm.type === 'image' ? 'image/*,.heic,.heif' : 'video/*'}
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category (optional)</label>
                  <input
                    type="text"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., hero, gallery, banner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>

                {uploadForm.type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text (optional)</label>
                    <input
                      type="text"
                      value={uploadForm.alt_text}
                      onChange={(e) => setUploadForm({ ...uploadForm, alt_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter alt text for accessibility"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      file: null,
                      type: 'image',
                      category: '',
                      title: '',
                      description: '',
                      alt_text: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.file}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingMedia && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Media</h2>
              
              <div className="mb-4">
                {editingMedia.type === 'image' ? (
                  <img src={editingMedia.url} alt={editingMedia.alt_text || ''} className="w-full h-64 object-cover rounded-lg" />
                ) : (
                  <video src={editingMedia.url} className="w-full h-64 object-cover rounded-lg" controls />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>

                {editingMedia.type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                    <input
                      type="text"
                      value={editForm.alt_text}
                      onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMedia(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

