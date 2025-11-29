import Footer from "@/components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="px-2 sm:px-4 lg:px-0 pb-12">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-900 mb-3">
          About 3Layered
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
          Transforming imagination into tangible creations, layer by layer.
        </p>
      </div>

      {/* Why We Made 3Layered Section */}
      <div className="mb-10 sm:mb-16">
        <div className="glass rounded-2xl p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
              Why We Made 3Layered
            </h2>
          </div>
          
          <div className="space-y-4 text-gray-800">
            <p className="text-base sm:text-lg leading-relaxed">
              In a world where ideas often remain confined to sketches and screens, we saw an opportunity to bridge the gap between imagination and reality. 3Layered was born from a passion for innovation and a belief that everyone should have access to high-quality 3D printing technology.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed">
              We started this journey to make 3D printing accessible, affordable, and exceptional. Whether you're an artist bringing sculptures to life, an entrepreneur prototyping your next big idea, or someone who simply wants a custom-made piece, we're here to help you create.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed">
              From functional products like desk lamps and mobile stands to artistic pieces and custom prototypes, we craft high-quality, precise, and beautifully finished prints. Every product is built layer by layer — merging creativity, technology, and craftsmanship.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed">
              We print in <span className="font-semibold text-emerald-600">PLA+</span>, <span className="font-semibold text-emerald-600">Premium PET-G</span>, and <span className="font-semibold text-emerald-600">Durable ABS</span> to match your strength, finish, and durability needs. Share your concept or model, and we'll partner with you to refine, prototype, and produce pieces that feel thoughtful and look exceptional.
            </p>
          </div>
        </div>
      </div>

      {/* Meet Our Team Section */}
      <div className="mb-10">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 mb-3">
            Meet Our Team
          </h2>
          <p className="text-base sm:text-lg text-gray-700">
            The visionaries behind 3Layered
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Founder - Jay Gehlot */}
          <div className="glass rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Image */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 rounded-full overflow-hidden ring-4 ring-emerald-500/20 shadow-lg bg-gray-100">
                <Image
                  src="https://naoazafsrpqglltizasu.supabase.co/storage/v1/object/public/Images/jay%20founder.JPG"
                  alt="Jay Gehlot - Founder"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 160px, 192px"
                  priority
                  unoptimized
                />
              </div>
              
              {/* Details */}
              <div className="space-y-2 mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-green-900">
                  Jay Gehlot
                </h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full border border-emerald-400/40">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-700">Founder</span>
                </div>
              </div>
              
              {/* Bio */}
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base mb-6">
                Jay Gehlot is the founder of 3Layered and a 2nd-year college student driven by innovation and creativity. He is building 3Layered as a multi-domain brand focused on modern solutions, design, and growth—balancing entrepreneurship with continuous learning.
              </p>
              
              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/919982781000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
                
                {/* Email Button */}
                <a
                  href="mailto:3Layered.in@gmail.com"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* CMO - Naman Singh Tomar */}
          <div className="glass rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Placeholder Avatar */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center ring-4 ring-emerald-500/20 shadow-lg">
                <span className="text-6xl sm:text-7xl font-bold text-white">
                  N
                </span>
              </div>
              
              {/* Details */}
              <div className="space-y-2 mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-green-900">
                  Naman Singh Tomar
                </h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full border border-emerald-400/40">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-700">CMO</span>
                </div>
              </div>
              
              {/* Bio */}
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base mb-6">
                With strong expertise in marketing and design, Naman co-founded 3Layered to make 3D printing accessible to everyone. His creative vision and strategic approach to branding ensure that 3Layered not only delivers outstanding products but also provides an exceptional customer experience. He focuses on building meaningful connections with clients and showcasing the limitless possibilities of 3D printing.
              </p>
              
              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/919243592559"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
                
                {/* Email Button */}
                <a
                  href="mailto:namansinghtomar.business@gmail.com"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="mt-10 sm:mt-16">
        <div className="glass rounded-2xl p-6 sm:p-8 md:p-10 text-center bg-gradient-to-br from-emerald-50/50 to-green-50/50">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 mb-4">
            Our Mission
          </h3>
          <p className="text-base sm:text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
            To empower creators, innovators, and dreamers by providing accessible, high-quality 3D printing services. We believe in turning ideas into reality, one layer at a time, and making technology work for you.
          </p>
        </div>
      </div>

      <Footer />
    </section>
  );
}
