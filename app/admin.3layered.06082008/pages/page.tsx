"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated, getAdminSession } from "@/lib/adminAuth";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  product?: string;
  fullReview: string;
  location?: string;
  verified: boolean;
  helpfulCount?: number;
}


interface HeroSection {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  discount?: number;
  validUntil?: string;
  link?: string;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

type TabType = "hero" | "features" | "offers" | "reviews";

export default function AdminPages() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("hero");
  const [saving, setSaving] = useState(false);
  
  // Hero Section state
  const [hero, setHero] = useState<HeroSection>({
    title: "You dream it we 3D it",
    description: "3Layered is a modern 3D printing studio that transforms imagination into tangible creations. From functional products like desk lamps and mobile stands to artistic pieces and custom prototypes, we craft high-quality, precise, and beautifully finished prints. Every product is built layer by layer — merging creativity, technology, and craftsmanship to bring your ideas to life. We print in PLA+, Premium PET-G, and Durable ABS.",
    primaryButtonText: "Start a Custom Print",
    primaryButtonLink: "/custom-print",
    secondaryButtonText: "Browse Products",
    secondaryButtonLink: "/products",
  });
  
  // Features state
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, title: "Materials We Use", description: "PLA+, Premium PET-G, and Durable ABS." },
    { id: 2, title: "Functional & Artistic", description: "Desk lamps, mobile stands, sculptures." },
    { id: 3, title: "Custom Prototypes", description: "Fast iteration with precise dimensions." },
  ]);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  
  // Special Offers state
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadContent();
    }
  }, [router, mounted]);

  const loadContent = async () => {
    try {
      const session = getAdminSession();
      const authHeader = session ? `Bearer ${JSON.stringify(session)}` : '';

      // Load all content sections
      const [heroRes, featuresRes, reviewsRes, offersRes] = await Promise.all([
        fetch("/api/admin/home-content/hero", { headers: { Authorization: authHeader } }),
        fetch("/api/admin/home-content/features", { headers: { Authorization: authHeader } }),
        fetch("/api/admin/home-content/reviews", { headers: { Authorization: authHeader } }),
        fetch("/api/admin/home-content/offers", { headers: { Authorization: authHeader } }),
      ]);

      if (heroRes.ok) {
        const data = await heroRes.json();
        if (data.hero) setHero(data.hero);
      }

      if (featuresRes.ok) {
        const data = await featuresRes.json();
        if (data.features) setFeatures(data.features);
      }

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data.reviews || []);
      } else {
        setReviews(getDefaultReviews());
      }

      if (offersRes.ok) {
        const data = await offersRes.json();
        if (data.offers) setSpecialOffers(data.offers);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      setReviews(getDefaultReviews());
    }
  };

  const getDefaultReviews = (): Review[] => [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      comment: "Absolutely stunning work! The desk lamp I ordered exceeded my expectations. The quality and finish are top-notch.",
      date: "2 weeks ago",
      product: "Desk Lamp",
      location: "Mumbai, India",
      verified: true,
      helpfulCount: 24,
      fullReview: "I recently ordered a custom desk lamp from 3Layered and I couldn't be happier with the result! The ordering process was smooth and the team was very responsive to my questions. The lamp arrived well-packaged and the quality is exceptional. The PLA+ material gives it a premium feel and the finish is flawless. The attention to detail is remarkable - every layer is perfectly aligned. The lamp is not only functional but also a beautiful piece of art on my desk. I've already recommended 3Layered to my colleagues and friends. Definitely worth every rupee!",
    },
    {
      id: 2,
      name: "Rahul Verma",
      rating: 5,
      comment: "Amazing custom print service! They brought my prototype to life with incredible precision. Highly recommend 3Layered!",
      date: "1 month ago",
      product: "Custom Prototype",
      location: "Bangalore, India",
      verified: true,
      helpfulCount: 31,
      fullReview: "As an engineering student working on my final year project, I needed a custom prototype printed with very specific dimensions. 3Layered not only met my requirements but exceeded them! The team was patient with my multiple revision requests and provided valuable suggestions to improve the design. The prototype was delivered ahead of schedule and the precision is incredible - down to 0.1mm accuracy. The ABS material they used is durable and perfect for functional testing. The pricing was very reasonable compared to other services I explored. This is a professional team that truly understands 3D printing technology. I'll definitely be using their services for future projects!",
    },
    {
      id: 3,
      name: "Ananya Patel",
      rating: 5,
      comment: "The Ganesha sculpture is beautifully detailed. The PET-G material gives it a premium look. Very satisfied!",
      date: "3 weeks ago",
      product: "God's Sculpture",
      location: "Ahmedabad, India",
      verified: true,
      helpfulCount: 18,
      fullReview: "I purchased a Ganesha sculpture for my home temple and it's absolutely divine! The level of detail captured in the 3D print is astounding - every feature of Lord Ganesha is perfectly rendered. The PET-G material has a beautiful sheen that makes it look almost like marble. The sculpture is sturdy yet elegant, and the size is perfect for my pooja room. What impressed me most was how the team ensured the cultural and religious aspects were respected. The packaging was also excellent with proper cushioning. This is a wonderful blend of technology and tradition. I'm planning to order more sculptures for gifting purposes. Highly recommended for anyone looking for quality religious artifacts!",
    },
    {
      id: 4,
      name: "Karthik Reddy",
      rating: 4,
      comment: "Great quality prints and fast delivery. The mobile stand is sturdy and looks modern. Will order again!",
      date: "1 week ago",
      product: "Mobile Stand",
      location: "Hyderabad, India",
      verified: true,
      helpfulCount: 12,
      fullReview: "Ordered a mobile stand for my desk setup and I'm quite pleased with it. The stand is sturdy and holds my phone at the perfect angle for video calls and watching content. The design is minimalist and modern, which fits well with my workspace aesthetic. The print quality is good with smooth surfaces and no visible layer lines. Delivery was faster than expected - received it in just 3 days! The only minor issue was that the color was slightly different from what I saw on the website, hence 4 stars instead of 5. But overall, it's a solid product at a fair price. The functionality is excellent and I use it daily. Will definitely order more products from 3Layered in the future!",
    },
    {
      id: 5,
      name: "Meera Singh",
      rating: 5,
      comment: "Love the collection! The attention to detail is remarkable. These guys really know their craft.",
      date: "2 months ago",
      product: "Custom Print",
      location: "Delhi, India",
      verified: true,
      helpfulCount: 27,
      fullReview: "I'm an avid collector and when I discovered 3Layered's collection, I was thrilled! I ordered three different items and each one is a masterpiece. The detail work is incredible - from the features to the textures, everything is perfectly captured. The items are well-balanced and can stand on their own without support. The finish is professional grade and the colors are vibrant. These aren't just products; they're display-worthy collectibles. The team was also open to custom requests and helped me design a unique piece. The pricing is competitive considering the quality. As a collector, I'm extremely satisfied and have already placed another order. 3Layered has definitely earned a loyal customer!",
    },
    {
      id: 6,
      name: "Arjun Nair",
      rating: 5,
      comment: "Fantastic experience from start to finish. The team helped me refine my design and the final product is perfect!",
      date: "3 weeks ago",
      product: "Custom Print",
      location: "Kochi, India",
      verified: true,
      helpfulCount: 20,
      fullReview: "I had a unique design idea but wasn't sure how to bring it to life. The 3Layered team was incredibly helpful throughout the entire process. They reviewed my initial sketches, provided CAD modeling assistance, and suggested design modifications to make it more print-friendly and structurally sound. The communication was excellent - they sent me preview renders and updates at each stage. When the final product arrived, I was blown away! The print quality exceeded my expectations and the finishing touches they added made it look professional. They used Premium PET-G which has great strength and a glossy finish. The pricing was transparent with no hidden costs. This is more than just a printing service; they're true partners in bringing your ideas to life. I've already started working with them on two more projects. Highly, highly recommended for anyone with custom printing needs!",
    },
  ];

  const handleSave = async (contentType: string, data: any) => {
    try {
      setSaving(true);
      const session = getAdminSession();
      const response = await fetch(`/api/admin/home-content/${contentType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.stringify(session)}`,
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} saved successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error(`Error saving ${contentType}:`, error);
      alert(`Error saving ${contentType}: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Review handlers
  const handleAddReview = () => {
    setEditingReview({
      id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      name: "",
      rating: 5,
      comment: "",
      date: "Just now",
      fullReview: "",
      verified: true,
      helpfulCount: 0,
    });
    setShowReviewModal(true);
  };

  const handleSaveReview = () => {
    if (!editingReview) return;
    if (editingReview.id && reviews.find(r => r.id === editingReview.id)) {
      setReviews(reviews.map(r => r.id === editingReview.id ? editingReview : r));
    } else {
      setReviews([...reviews, editingReview]);
    }
    setShowReviewModal(false);
    setEditingReview(null);
  };

  const handleDeleteReview = (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };


  // Offer handlers
  const handleAddOffer = () => {
    setEditingOffer({
      id: specialOffers.length > 0 ? Math.max(...specialOffers.map(o => o.id)) + 1 : 1,
      title: "",
      description: "",
      imageUrl: "",
      discount: 0,
      validUntil: "",
      link: "",
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = () => {
    if (!editingOffer) return;
    if (editingOffer.id && specialOffers.find(o => o.id === editingOffer.id)) {
      setSpecialOffers(specialOffers.map(o => o.id === editingOffer.id ? editingOffer : o));
    } else {
      setSpecialOffers([...specialOffers, editingOffer]);
    }
    setShowOfferModal(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = (id: number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      setSpecialOffers(specialOffers.filter(o => o.id !== id));
    }
  };

  // Feature handlers
  const handleAddFeature = () => {
    setFeatures([...features, { id: Date.now(), title: "", description: "" }]);
  };

  const handleDeleteFeature = (id: number) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      setFeatures(features.filter(f => f.id !== id));
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

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "hero", label: "Hero Section", icon: "🏠" },
    { id: "features", label: "Features", icon: "✨" },
    { id: "offers", label: "Special Offers", icon: "🎁" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Website Pages Editor</h1>
          <p className="text-gray-800 mt-2">Edit content displayed on your website pages</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-800 hover:text-gray-800"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section Tab */}
        {activeTab === "hero" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Hero Section</h2>
              <button
                onClick={() => handleSave("hero", { hero })}
                disabled={saving}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Hero Section"}
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={hero.title}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={hero.description}
                  onChange={(e) => setHero({ ...hero, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                  <input
                    type="text"
                    value={hero.primaryButtonText}
                    onChange={(e) => setHero({ ...hero, primaryButtonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Link</label>
                  <input
                    type="text"
                    value={hero.primaryButtonLink}
                    onChange={(e) => setHero({ ...hero, primaryButtonLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                  <input
                    type="text"
                    value={hero.secondaryButtonText}
                    onChange={(e) => setHero({ ...hero, secondaryButtonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Link</label>
                  <input
                    type="text"
                    value={hero.secondaryButtonLink}
                    onChange={(e) => setHero({ ...hero, secondaryButtonLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Features</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  + Add Feature
                </button>
                <button
                  onClick={() => handleSave("features", { features })}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Features"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <div key={feature.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[index].title = e.target.value;
                            setFeatures(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={feature.description}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[index].description = e.target.value;
                            setFeatures(updated);
                          }}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="ml-4 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Offers Tab */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Special Offers</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleAddOffer}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  + Add Offer
                </button>
                <button
                  onClick={() => handleSave("offers", { offers: specialOffers })}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Offers"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {offer.imageUrl ? (
                      <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{offer.title}</h3>
                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">{offer.description}</p>
                    {offer.discount && (
                      <p className="text-emerald-600 font-bold mb-2">{offer.discount}% OFF</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setShowOfferModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Customer Reviews</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleAddReview}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  + Add Review
                </button>
                <button
                  onClick={() => handleSave("reviews", { reviews })}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Reviews"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{review.name}</h3>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        {review.verified && (
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mb-1">{review.date}</p>
                      {review.product && (
                        <p className="text-sm text-gray-700 mb-2">Product: {review.product}</p>
                      )}
                      <p className="text-gray-700 line-clamp-2">"{review.comment}"</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingReview(review);
                          setShowReviewModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingReview.id && reviews.find(r => r.id === editingReview.id) ? "Edit Review" : "Add Review"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingReview.name}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Short)</label>
                  <textarea
                    value={editingReview.comment}
                    onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Review</label>
                  <textarea
                    value={editingReview.fullReview}
                    onChange={(e) => setEditingReview({ ...editingReview, fullReview: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                    <input
                      type="text"
                      value={editingReview.product || ""}
                      onChange={(e) => setEditingReview({ ...editingReview, product: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editingReview.location || ""}
                      onChange={(e) => setEditingReview({ ...editingReview, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="text"
                      value={editingReview.date}
                      onChange={(e) => setEditingReview({ ...editingReview, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., 2 weeks ago"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Helpful Count</label>
                    <input
                      type="number"
                      value={editingReview.helpfulCount || 0}
                      onChange={(e) => setEditingReview({ ...editingReview, helpfulCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingReview.verified}
                    onChange={(e) => setEditingReview({ ...editingReview, verified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Verified Purchase</label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveReview}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setEditingReview(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offer Modal */}
        {showOfferModal && editingOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingOffer.id && specialOffers.find(o => o.id === editingOffer.id) ? "Edit Offer" : "Add Offer"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editingOffer.title}
                    onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingOffer.description}
                    onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editingOffer.imageUrl}
                    onChange={(e) => setEditingOffer({ ...editingOffer, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      value={editingOffer.discount || 0}
                      onChange={(e) => setEditingOffer({ ...editingOffer, discount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={editingOffer.validUntil || ""}
                      onChange={(e) => setEditingOffer({ ...editingOffer, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link (Optional)</label>
                  <input
                    type="text"
                    value={editingOffer.link || ""}
                    onChange={(e) => setEditingOffer({ ...editingOffer, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="/products or https://..."
                  />
                </div>
                
                {editingOffer.imageUrl && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src={editingOffer.imageUrl} alt={editingOffer.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveOffer}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowOfferModal(false);
                    setEditingOffer(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
