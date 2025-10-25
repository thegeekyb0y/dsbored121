"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AppBar() {
  const session = useSession();

  return (
    <div>
      <div className="flex justify-between">
        <div className="p-2 m-2 font-bold cursor-pointer font-mono">Kraked</div>
        <div>
          {session.data?.user && (
            <button
              className="m-2 p-2 rounded-md cursor-pointer bg-orange-400"
              onClick={() => signOut()}
            >
              Log Out
            </button>
          )}
          {!session.data?.user && (
            <button
              className="m-2 p-2 rounded-md cursor-pointer bg-orange-400"
              onClick={() => signIn()}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
