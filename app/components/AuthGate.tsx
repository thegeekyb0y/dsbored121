"use client";

import { useSession, signIn } from "next-auth/react";
import { Lock, UserLock } from "lucide-react";
import { ReactNode } from "react";

interface AuthGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AuthGate({
  children,
  title = "Login Required",
  description = "Sign in to access this feature and sync your progress.",
}: AuthGateProps) {
  const { status } = useSession();
  const isGuest = status === "unauthenticated";

  return (
    <div className="relative h-full w-full">
      {/* Overlay for Guests */}
      {isGuest && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-[3px] border border-white/10 transition-all duration-500">
          <div className="bg-black/60 p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
            <div className="flex">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <UserLock className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2 text-left">
                  {title}
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-fit text-left">
                  {description}
                </p>
              </div>
            </div>
            <button
              onClick={() => signIn()}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all transform hover:scale-105 shadow-lg shadow-green-900/20"
            >
              Login to Unlock
            </button>
          </div>
        </div>
      )}

      {/* The actual content (Blurred if guest) */}
      <div
        className={`h-full transition-all duration-500 ${
          isGuest
            ? "opacity-20 pointer-events-none filter blur-sm"
            : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
