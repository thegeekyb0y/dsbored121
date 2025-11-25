"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-6xl mx-auto border-t-3 border-gray-600 hover:border-green-500 h-[80vh]">
        {" "}
        {/* Universal margin container */}
        <div className="flex w-full h-full overflow-hidden border border-gray-800 shadow-2xl bg-[#1a1a1a]">
          {/* Left Side: Login Functionality (2/3) */}
          <div className="w-full lg:w-2/3 p-8 md:p-12 flex flex-col justify-center relative bg-[#131212]">
            {/* Back Button */}
            <button
              onClick={() => router.push("/")}
              className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Timer
            </button>

            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                  <Image
                    src="/krakedlogo.png"
                    alt="Kraked Logo"
                    width={64}
                    height={64}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-gray-400 text-lg">
                  Sign in to continue your study streak
                </p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-3 cursor-pointer bg-white text-black hover:bg-gray-200 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.01] shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#131212] px-2 text-gray-500">
                      Don&apos;t have an account ?
                    </span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Link
                    href="/signup"
                    className="text-krakedlight bg-krakedlight/20 hover:bg-krakedlight/10 p-3 rounded-sm hover:text-green-400 font-medium transition-colors"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Image (1/3) */}
          <div className="hidden lg:block lg:w-1/3 relative bg-gray-900">
            <Image
              src="/signin.jpg"
              alt="Study Atmosphere"
              fill
              className="object-cover opacity-80"
              priority
              sizes="(max-width: 1024px) 0vw, 33vw"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            {/* Quote or Text on Image */}
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <blockquote className="font-medium text-lg mb-2">
                &quot;Success is the sum of small efforts, repeated day in and
                day out.&quot;
              </blockquote>
              <cite className="text-sm text-gray-400 not-italic">
                - Robert Collier
              </cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
