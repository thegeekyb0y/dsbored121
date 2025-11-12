"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Member {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface RoomData {
  room: {
    id: string;
    code: string;
    name: string;
    hostId: string;
    createdAt: string;
  };
  members: Member[];
}

export default function RoomPage() {
  const params = useParams();
  const { data: session } = useSession();
  const code = params.code as string;

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoomData();
  }, [code]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRoomData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading room...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!roomData) return <div>Room not found</div>;

  const isHost = session?.user?.id === roomData.room.hostId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-krakedbg shadow p-6 mb-6">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold mb-2">{roomData.room.name}</h1>
          <p className="text-krakedblue2 mb-4">Room Code: {roomData.room.id}</p>
        </div>
        {isHost && (
          <span className="inline-block bg-blue-600 text-white px-3 py-1 text-sm">
            Host
          </span>
        )}

        <div className="mt-2">
          <p className="text-sm text-krakedlight">
            Share this code with others to invite them!
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(roomData.room.code)}
            className="mt-2 bg-krakedblue px-4 py-2  hover:bg-krakedblue/60"
          >
            Copy Room Code
          </button>
        </div>
      </div>

      <div className="bg-krakedbg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Members ({roomData.members.length})
        </h2>

        <div className="space-y-3">
          {roomData.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-krakedblue/60 "
            >
              {member.user.image ? (
                <img
                  src={member.user.image}
                  alt={member.user.name || "User"}
                  className="w-10 h-10 "
                />
              ) : (
                <div className="w-10 h-10 bg-gray-400" />
              )}

              <div>
                <p className="font-medium">{member.user.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>

              {member.user.id === roomData.room.hostId && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 ">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
