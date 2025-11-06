"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewRoomPage() {
  const { data: session, status } = useSession();
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<FormMode>("create");
  type FormMode = "create" | "join";
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

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      setError("Room Code is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
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

  const title =
    mode === "create" ? "Create a New Room" : "Join an Existing Room";
  const buttonText = mode === "create" ? "Create Room" : "Join Room";
  const buttonDisabled =
    loading || (mode === "create" ? !roomName.trim() : !roomCode.trim());
  const handler = mode === "create" ? handleCreate : handleJoin;

  return (
    <div className="mx-auto max-w-sm bg-krakedgreen2 border-2 border-krakedlight rounded-md p-4 my-16 text-white">
      <div className="flex justify-around mb-4 border-b-2 border-krakedlight">
        <button
          className={`px-4 py-2 text-xl font-bold transition-colors ${
            mode === "create"
              ? "text-white border-b-4 border-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => {
            setMode("create");
            setError("");
          }}
        >
          Create
        </button>
        <button
          className={`px-4 py-2 text-xl font-bold transition-colors ${
            mode === "join"
              ? "text-white border-b-4 border-white"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => {
            setMode("join");
            setError("");
          }}
        >
          Join
        </button>
      </div>

      <h1 className="text-xl font-medium mb-2">{title}</h1>

      <div className="flex flex-col gap-2">
        {mode === "create" ? (
          <>
            <label className="text-md font-normal text-white">
              {" "}
              Room Name{" "}
            </label>
            <input
              type="text"
              placeholder="eg. Mission IAS"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-krakedlight rounded-md p-2 text-black"
            />
          </>
        ) : (
          <>
            <label className="text-md font-normal text-white">
              {" "}
              Room Code{" "}
            </label>
            <input
              type="text"
              placeholder="Enter 6 digit room code (e.g. XYZ123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="bg-krakedlight rounded-md p-2 text-black "
            />
          </>
        )}
        {error && <p className="text-red-500 mt-2 font-medium">{error}</p>}

        <button
          className="cursor-pointer w-full py-2 mt-4 rounded-md border-2 border-krakedlight bg-krakedgreen/60 hover:bg-krakedgreen/40 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handler}
          disabled={buttonDisabled}
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Joining..."
            : buttonText}
        </button>
      </div>
    </div>
  );
}
