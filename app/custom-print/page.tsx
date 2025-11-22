"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
const GlassScene = dynamic(() => import("@/components/GlassScene").then((m) => m.GlassScene), { 
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-sm text-emerald-700">Loading 3D preview...</p>
      </div>
    </div>
  )
});

// Contact support number
const CONTACT_SUPPORT_NUMBER = "+919982781000";

export default function CustomPrintPage() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [userName, setUserName] = useState(user?.user_metadata?.full_name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userPhone, setUserPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail) {
      setError("Email is required");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a project description");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/custom-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          user_email: userEmail,
          user_name: userName || null,
          user_phone: userPhone || null,
          description: description,
          drive_link: driveLink || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      setShowConfirmationPopup(true);
      setDescription("");
      setDriveLink("");
      setUserPhone("");
    } catch (err: any) {
      setError(err.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-2 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-green-900">
          Custom Print Order
        </h1>
        <p className="mt-3 sm:mt-4 text-green-900 max-w-prose text-sm sm:text-base leading-relaxed">
          Tell us about your custom 3D printing project and we'll help turn your ideas into reality. 
          Share details about your requirements including dimensions, function, aesthetics, materials, and any other specifications. 
          Our team will contact you to discuss your project and provide a quote.
        </p>

        {/* Contact Support */}
        <div className="mt-4 mb-6 p-4 glass rounded-xl border border-emerald-400/30">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p className="text-sm text-green-900 font-medium">Need Help?</p>
              <a 
                href={`tel:${CONTACT_SUPPORT_NUMBER.replace(/\s/g, '')}`}
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-lg"
              >
                {CONTACT_SUPPORT_NUMBER}
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* 3D Preview Section */}
          <div className="h-[280px] sm:h-[360px] md:h-[420px] glass rounded-2xl overflow-hidden relative">
            <GlassScene className="h-full" />
          </div>

          {/* Contact Information */}
          <div className="glass rounded-xl p-4 sm:p-5 md:p-6">
            <h2 className="text-lg font-semibold text-green-900 mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Your name"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="your@email.com"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="write your phone number here"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="glass rounded-xl p-4 sm:p-5 md:p-6">
            <label className="block text-sm sm:text-base font-medium text-green-900 mb-2">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Describe your custom 3D printing project in detail. Include:&#10;• What you want to create&#10;• Dimensions (length, width, height)&#10;• Purpose and functionality&#10;• Material preferences (PLA+, PET-G, ABS)&#10;• Finish requirements (smooth, textured, painted)&#10;• Quantity needed&#10;• Timeline/deadline&#10;• Any reference images or models (describe them)"
              disabled={submitting}
            />
            <p className="mt-2 text-xs text-green-900">
              <span className="font-semibold">Note:</span> Our team will contact you to discuss your project in detail and provide a customized quote. You can also share files during our conversation.
            </p>
          </div>

          {/* Google Drive Link Section */}
          <div className="glass rounded-xl p-4 sm:p-5 md:p-6">
            <label className="block text-sm sm:text-base font-medium text-green-900 mb-2">
              Google Drive Link (Optional)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-green-900">Share reference images, 3D models, or design files</span>
            </div>
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://drive.google.com/..."
              disabled={submitting}
            />
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">💡 Tip:</span> Upload your files to Google Drive, get a shareable link (make sure it's set to "Anyone with the link can view"), and paste it here.
              </p>
            </div>
          </div>

          {/* Order Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> Our team will call you for confirming your order and for taking some details of your custom print.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:text-white"
            >
              {submitting ? "Submitting Order..." : "Submit Custom Print Request"}
            </button>
            <a
              href={`tel:${CONTACT_SUPPORT_NUMBER.replace(/\s/g, '')}`}
              className="px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </a>
          </div>
        </form>
      </div>

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Submitted Successfully!</h2>
              <p className="text-gray-800 mb-6">
                Thank you for your custom print request! Our team will contact you shortly to discuss your project requirements, answer your questions, and provide a detailed quote.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Next Steps:</span> We'll review your requirements and reach out via email or phone within 24 hours.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConfirmationPopup(false);
                }}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </section>
  );
}
