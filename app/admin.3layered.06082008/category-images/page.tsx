"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminCategoryImagesAPI } from "@/lib/admin-api";

interface CategoryImage {
  key: string;
  label: string;
  imageUrl: string;
}

export default function AdminCategoryImages() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const categoryLabels: Record<string, string> = {
    "home-decor": "Home Decor",
    "table-top": "Table Top",
    "gods-sculpture": "God's Sculpture",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadCategoryImages();
    }
  }, [router, mounted]);

  const loadCategoryImages = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryImagesAPI.getAll();
      const images = data.categoryImages || {};
      
      // Convert to array format, filter out action-figure and only include known categories
      const imageArray: CategoryImage[] = Object.entries(images)
        .filter(([key]) => key !== 'action-figure' && categoryLabels[key]) // Only show categories we want
        .map(([key, url]) => ({
          key,
          label: categoryLabels[key] || key,
          imageUrl: url as string,
        }));
      
      // Ensure all required categories are present (add missing ones with defaults)
      const requiredCategories = Object.keys(categoryLabels);
      requiredCategories.forEach((key) => {
        if (!imageArray.find((item) => item.key === key)) {
          // Add missing category with default value
          const defaultUrl = key === 'home-decor' 
            ? '/api/category-image/home-decor'
            : key === 'table-top'
            ? 'https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg'
            : '/api/category-image/gods-sculpture';
          imageArray.push({
            key,
            label: categoryLabels[key],
            imageUrl: defaultUrl,
          });
        }
      });
      
      setCategoryImages(imageArray);
    } catch (error) {
      console.error("Error loading category images:", error);
      alert("Failed to load category images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (key: string, newUrl: string) => {
    setCategoryImages((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          return { ...item, imageUrl: newUrl };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert back to object format, exclude action-figure
      const imagesObject: Record<string, string> = {};
      categoryImages.forEach((item) => {
        if (item.key !== 'action-figure') {
          imagesObject[item.key] = item.imageUrl;
        }
      });

      await adminCategoryImagesAPI.update(imagesObject);
      alert("Category images saved successfully!");
      // Reload to reflect changes
      loadCategoryImages();
    } catch (error: any) {
      console.error("Error saving category images:", error);
      alert(`Failed to save category images: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all category images to default?")) {
      const defaultImages = {
        "home-decor": "/api/category-image/home-decor",
        "table-top": "https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg",
        "gods-sculpture": "/api/category-image/gods-sculpture",
      };

      const imageArray: CategoryImage[] = Object.entries(defaultImages).map(([key, url]) => ({
        key,
        label: categoryLabels[key] || key,
        imageUrl: url,
      }));

      setCategoryImages(imageArray);
      
      try {
        await adminCategoryImagesAPI.update(defaultImages);
        alert("Category images reset to default!");
      } catch (error) {
        console.error("Error resetting category images:", error);
        alert("Failed to reset category images");
      }
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-800">Loading category images...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Category Images</h1>
          <p className="text-gray-800 mt-2">Manage product category images displayed on the website</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Category Image URLs</h2>
          
          <div className="space-y-6">
            {categoryImages.map((category) => (
              <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {category.label} ({category.key})
                  </label>
                  <input
                    type="text"
                    value={category.imageUrl || ''}
                    onChange={(e) => handleImageChange(category.key, e.target.value)}
                    placeholder="Enter image URL"
                    disabled={saving}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                {/* Image Preview */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="relative w-full aspect-square max-w-xs bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x400/ef4444/ffffff?text=Image+Not+Found`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">No Image URL</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all border border-gray-300"
            >
              Reset to Default
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>You can use direct image URLs from Supabase Storage or any external CDN</li>
            <li>Make sure the URLs are publicly accessible</li>
            <li>Recommended image size: 800x800px or larger (square format preferred)</li>
            <li>Changes will be reflected immediately on the website after saving</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

