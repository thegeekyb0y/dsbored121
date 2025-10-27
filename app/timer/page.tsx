"use client";
import { useSession } from "next-auth/react";
import TimerComp from "../components/TimerComp";

export function Timer() {
  const session = useSession();

  return (
    <div>
      {session.data?.user && <TimerComp />}
      {!session.data?.user && (
        <button>Signin to save progress for stats</button>
      )}
    </div>
  );
}
