"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminProductsAPI } from "@/lib/admin-api";

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  images?: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  is_trending?: boolean;
  is_featured?: boolean;
  is_customizable?: boolean;
  discount_percentage?: number;
  material?: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Product>({
    title: "",
    description: "",
    price: 0,
    category: "home-decor",
    inventory: 0,
    images: [],
    dimensions: {
      length: undefined,
      width: undefined,
      height: undefined,
      unit: "cm"
    },
    is_trending: false,
    is_featured: false,
    is_customizable: false,
    discount_percentage: 0,
    material: ""
  });
  const [finalPrice, setFinalPrice] = useState<number>(0); // Final price (discounted price) that admin enters

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadProducts();
    }
  }, [router, mounted]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminProductsAPI.getAll();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      // Calculate final price from stored price and discount
      const storedPrice = product.price || 0;
      const discount = product.discount_percentage || 0;
      const calculatedFinalPrice = discount > 0 
        ? storedPrice * (1 - discount / 100)
        : storedPrice;
      
      setFinalPrice(calculatedFinalPrice);
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: storedPrice, // This will be recalculated when saving
        category: product.category || "home-decor",
        inventory: product.inventory || 0,
        images: product.images || [],
        dimensions: product.dimensions || {
          length: undefined,
          width: undefined,
          height: undefined,
          unit: "cm"
        },
        is_trending: product.is_trending || false,
        is_featured: product.is_featured || false,
        is_customizable: product.is_customizable || false,
        discount_percentage: discount,
        material: product.material || "",
      });
    } else {
      setEditingProduct(null);
      setFinalPrice(0);
      setFormData({
        title: "",
        description: "",
        price: 0,
        category: "home-decor",
        inventory: 0,
        images: [],
        dimensions: {
          length: undefined,
          width: undefined,
          height: undefined,
          unit: "cm"
        },
        is_trending: false,
        is_featured: false,
        is_customizable: false,
        discount_percentage: 0,
        material: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSaving(false);
  };

  // Calculate actual price from final price and discount percentage
  const calculateActualPrice = (finalPrice: number, discountPercentage: number): number => {
    if (!finalPrice || finalPrice <= 0) return 0;
    if (!discountPercentage || discountPercentage <= 0) return Math.round(finalPrice);
    
    // Actual Price = Final Price / (1 - Discount/100)
    const discountMultiplier = 1 - (discountPercentage / 100);
    const actualPrice = finalPrice / discountMultiplier;
    return Math.round(actualPrice); // Round to nearest whole number
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Calculate actual price from final price and discount
      const actualPrice = calculateActualPrice(finalPrice, formData.discount_percentage || 0);
      
      // Prepare product data with calculated actual price (rounded to nearest whole number)
      const productData = {
        ...formData,
        price: actualPrice // Already rounded to nearest whole number
      };

      if (editingProduct) {
        await adminProductsAPI.update(editingProduct.id!, productData);
      } else {
        await adminProductsAPI.create(productData);
      }
      await loadProducts();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? (Soft delete - can be restored)")) return;

    try {
      setDeleteId(id);
      await adminProductsAPI.delete(id, false); // Soft delete
      await loadProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(error.message || "Failed to delete product");
    } finally {
      setDeleteId(null);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-800 mt-2">Manage your product catalog</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            + Add Product
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-800 text-lg">No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                {product.images && product.images[0] ? (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300?text=No+Image";
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-gray-800 text-sm mb-3 line-clamp-2">
                    {product.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{parseFloat(product.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-700">
                        Stock: {product.inventory}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors border border-emerald-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteId === product.id}
                      className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors border border-red-200 disabled:opacity-50"
                    >
                      {deleteId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                    {product.is_trending && (
                      <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                        🔥 Trending
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                        ⭐ Featured
                      </span>
                    )}
                    {product.is_customizable && (
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✏️ Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 border-b border-emerald-500">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Price (₹) <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-700 ml-2">(Price after discount)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(Math.round(parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {finalPrice > 0 && formData.discount_percentage && formData.discount_percentage > 0 && (
                    <p className="text-xs text-gray-800 mt-1">
                      Actual Price: ₹{calculateActualPrice(finalPrice, formData.discount_percentage || 0).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inventory <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="home-decor">Home Decor</option>
                    <option value="table-top">Table Top</option>
                    <option value="gods-sculpture">Gods Sculpture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., PLA+"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Add multiple URLs)
                </label>
                <div className="space-y-2">
                  {formData.images?.map((image, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...(formData.images || [])];
                          newImages[index] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images?.filter((_, i) => i !== index) || [];
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, images: [...(formData.images || []), ""] });
                    }}
                    className="w-full px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    + Add Image URL
                  </button>
                </div>
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      image && (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }} />
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-800 mb-1">Length</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.length || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          length: e.target.value ? parseFloat(e.target.value) : undefined,
                          unit: formData.dimensions?.unit || "cm"
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-800 mb-1">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.width || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width: e.target.value ? parseFloat(e.target.value) : undefined,
                          unit: formData.dimensions?.unit || "cm"
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-800 mb-1">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.height || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          height: e.target.value ? parseFloat(e.target.value) : undefined,
                          unit: formData.dimensions?.unit || "cm"
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-800 mb-1">Unit</label>
                    <select
                      value={formData.dimensions?.unit || "cm"}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          unit: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {finalPrice > 0 && formData.discount_percentage && formData.discount_percentage > 0 && (
                  <p className="text-xs text-gray-800 mt-1">
                    Actual Price: ₹{calculateActualPrice(finalPrice, formData.discount_percentage || 0).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 bg-gray-50 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">🔥 Mark as Trending</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 bg-gray-50 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">⭐ Mark as Featured</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_customizable}
                    onChange={(e) => setFormData({ ...formData, is_customizable: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 bg-gray-50 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">✏️ Allow Customization</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-all disabled:opacity-50 border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
