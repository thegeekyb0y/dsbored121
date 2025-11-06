"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

export default function NewRoomPage() {
  const { data: session, status } = useSession();
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: roomName.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      router.push(`/rooms/${data.roomCode}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl">You need to login to access your stats.</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg bg-krakedgreen2 border-2 border-krakedlight rounded-md p-4 my-16 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold ">Create a Room</h1>
        <label className=" text-xl font-medium text-krakedlight ">
          Room Name
        </label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="some cool room name"
          className="bg-krakedlight rounded-md p-2 text-black"
        />
        <button
          className="cursor-pointer w-full  py-2 rounded-md border-2 border-krakedlight bg-krakedgreen/60 hover:bg-krakedgreen/40 disabled:cursor-not-allowed"
          onClick={handleCreate}
          disabled={!roomName || loading}
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}
