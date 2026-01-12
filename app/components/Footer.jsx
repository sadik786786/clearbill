'use client';

import Link from "next/link";
import { FiHeart } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Copyright */}
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span>© {new Date().getFullYear()} ClearBill</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="flex items-center gap-1 text-blue-500">
              <FiHeart className="w-3 h-3" />
              <span>Made for you</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-4 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              Privacy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/help" className="hover:text-blue-600 transition-colors">
              Help
            </Link>
          </div>
        </div>

        {/* Simple tagline */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Streamlining invoicing for businesses worldwide
          </p>
        </div>

      </div>
    </footer>
  );
}