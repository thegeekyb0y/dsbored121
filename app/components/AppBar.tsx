"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AppBar() {
  const session = useSession();
  const router = useRouter();

  const handleStatsClick = () => {
    router.push("/stats");
  };

  const handleRoomCreations = () => {
    router.push("/rooms/new");
  };

  return (
    <div>
      <div className="flex z-50 justify-between bg-neutral-900 border-b border-b-krakedlight/20 items-center mx-4 px-2 py-2 rounded-b-xl backdrop-blur-3xl md:mx-20">
        <div className="p-2 m-2 font-bold cursor-pointer font-mono">Kraked</div>
        <div>
          {session.data?.user && (
            <div>
              <button
                className="m-2 px-2 py-1 rounded-md cursor-pointer bg-krakedgreen2/40 text-white font-medium"
                onClick={() => {
                  handleRoomCreations();
                }}
              >
                Create Room
              </button>
              <button
                className="m-2 px-2 py-1 rounded-md cursor-pointer font-medium"
                onClick={() => {
                  handleStatsClick();
                }}
              >
                Stats
              </button>
              <button
                className="m-2 px-2 py-1 rounded-md cursor-pointer bg-gray-400/20 font-medium"
                onClick={() => signOut()}
              >
                Log Out
              </button>
            </div>
          )}
          {!session.data?.user && (
            <div>
              <button
                className="m-2 p-2 rounded-md cursor-pointer bg-krakedgreen2 text-white font-medium"
                onClick={() => {
                  handleRoomCreations();
                }}
              >
                Create Room
              </button>
              <button
                className="m-2 p-2 rounded-md cursor-pointer bg-gray-400/20 font-medium"
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
