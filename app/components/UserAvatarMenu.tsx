"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import { getAvatarById } from "@/lib/constants";

export function UserAvatarMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user's avatarId
  useEffect(() => {
    const fetchAvatar = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/user/profile");
          const data = await res.json();
          if (data.user?.avatarId) {
            setAvatarId(data.user.avatarId);
          }
        } catch (error) {
          console.error("Failed to fetch avatar:", error);
        }
      }
    };
    fetchAvatar();
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!session?.user) return null;

  const customAvatar = avatarId ? getAvatarById(avatarId) : null;
  const avatarSrc = customAvatar?.src || session.user.image;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-krakedblue/30 px-2 py-1.5 transition-colors group"
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-green-500/50 transition-all"
            unoptimized={true}
          />
        ) : (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm text-white font-bold ring-2 ring-transparent group-hover:ring-green-500/50 transition-all">
            {session.user.name?.[0] || "U"}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-gray-700  shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-700 bg-krakedblue/20">
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={session.user.name || "User"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized={true}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-lg text-white font-bold">
                  {session.user.name?.[0] || "U"}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-white truncate">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                router.push("/profile");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-krakedblue/30 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Edit Profile</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-700">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
