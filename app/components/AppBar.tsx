"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppBar() {
  const session = useSession();
  const router = useRouter();

  const handleStatsClick = () => {
    router.push("/stats");
  };

  const handleRoomCreations = () => {
    router.push("/rooms/");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 p-4 ">
      <div className="flex justify-between bg-neutral-900 border border-krakedlight/50 items-center mx-auto px-4 py-2  backdrop-blur-3xl max-w-6xl">
        <div className=" flex flex-row gap-2 p-2 m-2 font-bold cursor-pointer font-mono text-white items-center">
          <Image
            src={"/krakedlogo.png"}
            alt={"Logo"}
            width={40}
            height={40}
            className="w-8 h-8 rounded-full object-cover"
            unoptimized={true} // Assuming external images might not need optimization
          />
          <Link href={"/"}> Kraked </Link>
        </div>

        <div>
          {session.data?.user && (
            <div className="flex items-center space-x-2">
              <button
                className="px-2 py-1  cursor-pointer bg-green-500/40 text-white font-medium hover:bg-green-500/60 transition-colors"
                onClick={handleRoomCreations}
              >
                Rooms
              </button>
              <button
                className="px-2 py-1  cursor-pointer text-gray-300 hover:text-white font-medium transition-colors"
                onClick={handleStatsClick}
              >
                Stats
              </button>
              <button
                className="px-2 py-1  cursor-pointer bg-gray-400/20 text-white font-medium hover:bg-gray-400/40 transition-colors"
                onClick={() => signOut()}
              >
                Log Out
              </button>
            </div>
          )}
          {!session.data?.user && (
            <div className="flex items-center space-x-2">
              <button
                className="px-2 py-1 cursor-pointer bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                onClick={handleRoomCreations}
              >
                Create Room
              </button>
              <button
                className="px-2 py-1 cursor-pointer bg-gray-400/20 text-white font-medium hover:bg-gray-400/40 transition-colors"
                onClick={() => signIn()}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
