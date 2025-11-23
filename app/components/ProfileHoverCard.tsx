"use client";

import { getAvatarById } from "@/lib/constants";
import { Calendar, UserIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface UserProfile {
  name: string | null;
  bio: string | null;
  status: string | null;
  image: string | null;
  joinedAt?: string;
  email: string | null;
  avatarId: string | null;
}

interface ProfileHoverCardProps {
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  userAvatarId?: string | null;
  joinedAt?: string;
  isHost?: boolean;
  children: React.ReactNode;
}

export function ProfileHoverCard({
  userId,
  userName,
  userImage,
  userAvatarId,
  joinedAt,
  isHost,
  children,
}: ProfileHoverCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovering) {
      timer = setTimeout(() => setShowCard(true), 500);
    } else {
      setShowCard(false);
    }
    return () => clearTimeout(timer);
  }, [isHovering]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!showCard || profile || loading) return;
      setLoading(true);

      try {
        const response = await fetch(`/api/user/profile/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch profile : ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showCard, userId, profile, loading]);

  const customAvatar = userAvatarId ? getAvatarById(userAvatarId) : null;
  const avatarSrc = customAvatar?.src || userImage;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}

      {/* Hover Card */}
      {showCard && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-[#0a0a0a] border border-gray-700 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header Background Gradient */}
          <div className="h-20 bg-linear-to-br from-krakedblue via-krakedblue2 to-krakedgreen2" />

          {/* Profile Content */}
          <div className="px-4 pb-4 -mt-10 relative">
            {/* Avatar */}
            <div className="mb-3">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={userName || "User"}
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-full object-cover ring-4 ring-[#0a0a0a]"
                  unoptimized={true}
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-gray-600 flex items-center justify-center text-2xl text-white font-bold ring-4 ring-[#0a0a0a]">
                  {userName?.[0] || "U"}
                </div>
              )}
            </div>

            {/* Name and Host Badge */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">
                {profile?.name || userName || "Unknown User"}
              </h3>
              {isHost && (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium">
                  Host
                </span>
              )}
            </div>

            {/* Status */}
            {(profile?.status || loading) && (
              <div className="mb-3">
                {loading ? (
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                ) : (
                  <p className="text-sm text-gray-300 italic">
                    {profile?.status}
                  </p>
                )}
              </div>
            )}

            {/* Bio */}
            {(profile?.bio || loading) && (
              <div className="mb-3">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 bg-gray-800 rounded animate-pulse w-4/5" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {profile?.bio}
                  </p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-800">
              {joinedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Joined{" "}
                    {new Date(joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Member</span>
              </div>
            </div>

            {/* Loading State */}
            {loading && !profile && (
              <div className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
