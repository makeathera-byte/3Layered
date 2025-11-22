"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated, getAdminSession } from "@/lib/adminAuth";

export default function AdminSettings() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "3 Layered",
    storeEmail: "3layerd.in@gmail.com",
    storePhone: "+91 9982781000",
    storeAddress: "Pune, Maharashtra, India",
    currency: "INR",
    taxRate: "18",
  });
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadSettings();
    }
  }, [router, mounted]);

  const loadSettings = async () => {
    try {
      const session = getAdminSession();
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${JSON.stringify(session)}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
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

  const handleSave = async () => {
    try {
      const session = getAdminSession();
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.stringify(session)}`,
        },
        body: JSON.stringify({ settings }),
      });
      
      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to save settings: ${error.error || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      alert(`Error saving settings: ${error.message || "Unknown error"}`);
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all settings?")) {
      const defaultSettings = {
        storeName: "3 Layered",
        storeEmail: "3layerd.in@gmail.com",
        storePhone: "+91 9982781000",
        storeAddress: "Pune, Maharashtra, India",
        currency: "INR",
        taxRate: "18",
      };
      setSettings(defaultSettings);
      
      try {
        const session = getAdminSession();
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.stringify(session)}`,
          },
          body: JSON.stringify({ settings: defaultSettings }),
        });
        
        if (response.ok) {
          alert("Settings reset to default!");
        } else {
          alert("Failed to reset settings");
        }
      } catch (error) {
        console.error("Error resetting settings:", error);
        alert("Error resetting settings");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-800 mt-2">Manage store settings and preferences</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Store Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                rows={3}
                className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                  className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-2 text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Save Settings
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all border border-gray-300"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

