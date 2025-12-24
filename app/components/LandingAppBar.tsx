"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

export function LandingAppBar() {
  const session = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 200);
  };

  // --- NEW HELPER FUNCTION ---
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Close mobile menu if it's open
      if (mobileMenuOpen) {
        handleCloseMenu();
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleCloseMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        handleCloseMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseMenu}
        />
      )}

      <div className="fixed top-0 left-0 w-full z-50 p-2 sm:p-4">
        <div className="flex justify-between bg-neutral-900 border border-krakedlight/50 items-center mx-auto px-3 sm:px-4 py-2 backdrop-blur-3xl max-w-6xl">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 p-1 sm:p-2 font-bold font-mono text-white hover:text-green-400 transition-colors"
          >
            <Image
              src="/krakedlogo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              unoptimized
            />
            <span className="hidden sm:inline">Kraked</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Common Buttons (Visible to both logged in and logged out) */}
            <button
              onClick={() => scrollToSection("features")}
              className="px-3 py-1.5 cursor-pointer text-gray-300 hover:text-white font-medium transition-colors text-sm rounded-sm"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-to-use")}
              className="px-3 py-1.5 cursor-pointer text-gray-300 hover:text-white font-medium transition-colors text-sm"
            >
              How to Use
            </button>

            {/* Auth Specific Buttons */}
            {session.data?.user ? (
              <button
                className="px-3 py-1.5 cursor-pointer bg-krakedlight text-black font-medium hover:bg-krakedlight/90 transition-colors text-sm rounded-sm"
                onClick={() => signIn()}
              >
                Start Studying
              </button>
            ) : (
              <button
                className="px-3 py-1.5 cursor-pointer bg-gray-400/20 text-white font-medium hover:bg-gray-400/40 transition-colors text-sm rounded-sm"
                onClick={() => signIn()}
              >
                Start Studying
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={buttonRef}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => {
              if (mobileMenuOpen) {
                handleCloseMenu();
              } else {
                setMobileMenuOpen(true);
              }
            }}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className={`md:hidden absolute top-full left-0 right-0 bg-neutral-900 border-x border-b border-krakedlight/50 mx-2 sm:mx-4 mt-1 backdrop-blur-3xl overflow-hidden transition-all duration-200 ease-out ${
              isClosing
                ? "opacity-0 -translate-y-2 max-h-0"
                : "opacity-100 translate-y-0 max-h-screen"
            }`}
            style={{
              animation: isClosing
                ? "slideUp 200ms ease-out"
                : "slideDown 200ms ease-out",
            }}
          >
            <div className="flex flex-col p-4 space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="w-full px-4 py-3 text-left text-gray-300 font-medium transition-all rounded-sm active:scale-95"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-to-use")}
                className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-all rounded-sm active:scale-95"
              >
                How to Use
              </button>

              {session.data?.user ? (
                <button className="w-full px-4 py-3 text-left bg-gray-400/20 text-white font-medium hover:bg-gray-400/40 transition-all rounded-sm active:scale-95">
                  Start Studying
                </button>
              ) : (
                <button
                  className="w-full px-4 py-3 text-left bg-gray-400/20 text-white font-medium hover:bg-gray-400/40 transition-all rounded-sm active:scale-95"
                  onClick={() => {
                    signIn();
                    handleCloseMenu();
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
