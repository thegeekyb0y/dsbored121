"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, User } from "lucide-react";
import { AVATARS } from "@/lib/constants";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  // Fetch existing data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/user/profile");
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || "");
            setBio(data.user.bio || "");
            setUserStatus(data.user.status || "");
            setSelectedAvatar(data.user.avatarId || AVATARS[0].id);
          }
        } catch (error) {
          console.error("Failed to load profile", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [status]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          status: userStatus,
          avatarId: selectedAvatar,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      await update(); // Refresh NextAuth session
      router.refresh();
      alert("Profile updated!");
    } catch (error) {
      alert("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl text-gray-300">
          Please log in to edit your profile.
        </p>
        <button
          onClick={() => router.push("/api/auth/signin")}
          className="bg-green-600 px-6 py-3 rounded text-white font-bold"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20"
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar Selection */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-krakedblue2" />
              Choose Avatar
            </h2>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? "border-green-500 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      : "border-transparent bg-black/20 hover:border-gray-600"
                  }`}
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.label}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="(max-width: 768px) 25vw, 15vw"
                  />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute inset-0 bg-green-500/20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Text Fields */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-white transition-all placeholder:text-gray-600"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <input
                type="text"
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
                placeholder="e.g. Grinding Algorithms ⚡️"
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-white transition-all placeholder:text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Visible to others in study rooms.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-white transition-all min-h-[120px] resize-none placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
