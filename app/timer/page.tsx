"use client";
import { useSession } from "next-auth/react";
import TimerComp from "../components/TimerComp";

export default function Timer() {
  const session = useSession();

  return (
    <div>
      <TimerComp />
      {!session && (
        <div className="mt-8 text-center text-gray-600">
          <p>💡 Login to track your study sessions and see stats!</p>
        </div>
      )}
    </div>
  );
}
