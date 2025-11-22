"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Reviews from "@/components/Reviews";
import ConnectWithUs from "@/components/ConnectWithUs";
import GlassSceneFinal from "@/components/GlassSceneFinal";

interface HeroSection {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

interface Feature {
  id: number;
  title: string;
  description: string;
}

interface SpecialOffer {
  id: string;
  title: string;
  imageUrl: string | null;
  productId: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
}

export default function HomePage() {
  const [hero, setHero] = useState<HeroSection>({
    title: "You dream it we 3D it",
    description: "3Layered is a modern 3D printing studio that transforms imagination into tangible creations. From functional products like desk lamps and mobile stands to artistic pieces and custom prototypes, we craft high-quality, precise, and beautifully finished prints. Every product is built layer by layer — merging creativity, technology, and craftsmanship to bring your ideas to life. We print in PLA+, Premium PET-G, and Durable ABS.",
    primaryButtonText: "Start a Custom Print",
    primaryButtonLink: "/custom-print",
    secondaryButtonText: "Browse Products",
    secondaryButtonLink: "/products",
  });

  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, title: "Materials We Use", description: "PLA+, Premium PET-G, and Durable ABS." },
    { id: 2, title: "Functional & Artistic", description: "Desk lamps, mobile stands, sculptures." },
    { id: 3, title: "Custom Prototypes", description: "Fast iteration with precise dimensions." },
  ]);

  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [heroRes, featuresRes, offersRes] = await Promise.all([
        fetch("/api/home-content/hero"),
        fetch("/api/home-content/features"),
        fetch("/api/home-content/special-offers"),
      ]);

      if (heroRes.ok) {
        const data = await heroRes.json();
        if (data.hero) setHero(data.hero);
      }

      if (featuresRes.ok) {
        const data = await featuresRes.json();
        if (data.features) setFeatures(data.features);
      }

      if (offersRes.ok) {
        const data = await offersRes.json();
        if (data.offers) setSpecialOffers(data.offers);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryImages = {
    "HOME DECOR": "/api/category-image/home-decor",
    "TABLE TOP": "https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/halo%205.jpg",
    "ACTION FIGURE": "https://cdn.shopify.com/s/files/1/0931/6948/4063/files/il_fullxfull.4697843338_l1qb.webp?v=1757274835",
    "GOD'S SCULPTURE": "/api/category-image/gods-sculpture",
  };

  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl glass p-6 md:p-10">
        <div className="absolute inset-0 bg-radial-faint" />
        <div className="absolute inset-0 bg-radial-strong" />
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="z-10">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {hero.title}
            </h1>
            <p className="mt-4 text-moss max-w-prose">
              {hero.description}
            </p>
            <div className="mt-6 flex gap-3">
              <Link href={hero.primaryButtonLink} className="glass px-4 py-2 rounded-md shadow-glow">
                {hero.primaryButtonText}
              </Link>
              <Link href={hero.secondaryButtonLink} className="px-4 py-2 rounded-md border border-white/20 text-moss hover:text-moss">
                {hero.secondaryButtonText}
              </Link>
            </div>
          </div>
          <div className="h-[360px] md:h-[420px] rounded-2xl overflow-hidden">
            <GlassSceneFinal className="h-full" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div key={f.id} className="glass rounded-xl p-5">
            <h3 className="font-medium">{f.title}</h3>
            <p className="text-moss mt-2">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-moss">Special Offers</h2>
        {loading ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/10" />
                <div className="p-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : specialOffers.length > 0 ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {specialOffers.map((offer) => {
              const cardContent = (
                <>
                  <div className="relative w-full aspect-square bg-white/10 ring-1 ring-white/10">
                    {offer.imageUrl && offer.imageUrl.trim() !== "" ? (
                      <>
                        <img
                          src={offer.imageUrl}
                          alt={offer.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/400x400/4ade80/ffffff?text=${encodeURIComponent(offer.title)}`;
                          }}
                        />
                        {offer.discountPercentage > 0 && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg z-10">
                            {offer.discountPercentage}% OFF
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/25 to-emerald-400/20 mix-blend-soft-light group-hover:opacity-90 transition-opacity" />
                  </div>
                  <div className="p-4 text-center space-y-2">
                    <span className="text-moss font-semibold tracking-wide block">{offer.title}</span>
                    {offer.discountedPrice > 0 && (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-emerald-600 font-bold text-lg">
                          ₹{offer.discountedPrice.toLocaleString()}
                        </span>
                        {offer.price && offer.discountPercentage > 0 && (
                          <>
                            <span className="text-gray-700 line-through text-sm">
                              ₹{offer.price.toLocaleString()}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                              {offer.discountPercentage}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );

              return (
                <Link 
                  key={offer.id} 
                  href={`/products/${offer.productId}`}
                  className="group glass rounded-xl overflow-hidden hover:shadow-glow transition-shadow block cursor-pointer"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 text-center py-12">
            <p className="text-moss text-lg">No special offers available at the moment</p>
          </div>
        )}
      </div>

      <Reviews />

      <ConnectWithUs />

      {/* Footer */}
      <footer className="mt-12 mb-6">
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left: Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm sm:text-base text-moss">
                © {new Date().getFullYear()} All rights reserved 3Layered
              </p>
            </div>

            {/* Center: Terms Link */}
            <div>
              <Link 
                href="/terms" 
                className="glass px-4 py-2 rounded-md hover:shadow-glow transition-all text-xs sm:text-sm font-medium inline-block"
              >
                Terms & Conditions
              </Link>
            </div>

            {/* Right: Made with credit */}
            <div className="text-center md:text-right">
              <a 
                href="https://makeathera.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs text-moss hover:text-emerald-600 transition-colors"
              >
                Made with MakeAthera
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
