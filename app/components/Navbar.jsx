'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import GoogleLoginButton from "./GoogleLoginButton";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiSettings
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Clients", href: "/clients" },
  { name: "Invoices", href: "/invoices" },
  { name: "About", href: "/about" }
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const linkClass = (href) =>
    `relative px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
     ${
       pathname.startsWith(href)
         ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20"
         : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
     }`;

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-lg" 
          : "bg-white border-b"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            ClearBill
          </Link>

          {/* Desktop Navigation - Show only when logged in */}
          {session && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={linkClass(link.href)}
                >
                  {link.name}
                  {pathname.startsWith(link.href) && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop User Menu - Show different options based on auth status */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              // Logged in - Show user dropdown
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="relative">
                    <img
                      src={session.user.image || "/default-avatar.png"}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border-2 border-white shadow-md group-hover:border-blue-100 transition-all duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                  <FiChevronDown 
                    className={`text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu for logged in user */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut className="text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Not logged in - Show Google login button only (no dropdown)
              <GoogleLoginButton 
                className="px-4 py-2 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
                text="Continue with Google"
              />
            )}
          </div>

          {/* Mobile Menu Button - Always show regardless of auth status */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <motion.div
                  animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="absolute w-6 h-0.5 bg-gray-700 rounded-full"
                />
                <motion.div
                  animate={open ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute w-6 h-0.5 bg-gray-700 rounded-full top-2"
                />
                <motion.div
                  animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="absolute w-6 h-0.5 bg-gray-700 rounded-full top-4"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl rounded-b-2xl mx-4 mt-2 overflow-hidden z-50"
            >
              {session ? (
                // Logged in mobile menu
                <>
                  {/* User Info */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={session.user.image || "/default-avatar.png"}
                          className="w-14 h-14 rounded-full border-4 border-white shadow-lg"
                          alt="Profile"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-gray-900 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-4 space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                          pathname.startsWith(link.href)
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                      >
                        <span className="flex-1">{link.name}</span>
                        {pathname.startsWith(link.href) && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 border-t">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-red-200 hover:scale-[1.02] transition-all duration-200"
                    >
                      <FiLogOut className="text-white" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                // Not logged in mobile menu
                <div className="p-6">
                  <div className="mb-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">CB</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to ClearBill
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Sign in to access your account
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <GoogleLoginButton 
                      className="w-full justify-center py-3"
                      onSuccess={() => setOpen(false)}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      By signing in, you agree to our Terms and Privacy Policy
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}