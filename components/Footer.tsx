import Link from "next/link";

export default function Footer() {
  return (
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
  );
}

