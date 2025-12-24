"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Calendar, Plus, ArrowRight, LogIn } from "lucide-react";
import { RoomsSkeleton } from "@/app/components/RoomsSkeleton";

interface Room {
  code: string;
  name: string;
  memberCount: number;
  isHost: boolean;
  joinedAt: string;
}

export default function RoomsListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch rooms if session exists
    if (session) {
      fetchMyRooms();
    } else {
      // If no session, stop loading state but don't proceed to fetch
      setLoading(false);
    }
  }, [session]);

  const fetchMyRooms = async () => {
    try {
      const response = await fetch("/api/rooms/my-rooms");
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW UNATHENTICATED STATE CHECK ---
  if (!session && !loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-krakedblue/20 border-2 border-krakedlight/50 p-12 text-center shadow-2xl">
          <LogIn className="w-12 h-12 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3 text-white">
            Access Study Rooms
          </h2>
          <p className="text-gray-400 mb-8">
            You need to be logged in to **create or join** study rooms and
            collaborate with others.
          </p>
          <button
            onClick={() => router.push("/api/auth/signin")}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-8 py-4 font-bold text-lg transition-colors mx-auto"
          >
            <LogIn className="w-5 h-5" />
            Log In to Continue
          </button>
        </div>
      </div>
    );
  }
  // -----------------------------------------

  // Use skeleton component instead of inline loading
  if (loading) {
    return <RoomsSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto px-1 py-12">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <div className="text-md font-normal mb-1 md:mb-2">My Study Rooms</div>
          <p className="text-gray-400">
            {rooms.length === 0
              ? "You haven't joined any rooms yet"
              : `You're part of ${rooms.length} ${
                  rooms.length === 1 ? "room" : "rooms"
                }`}
          </p>
        </div>

        <button
          onClick={() => router.push("/rooms/new")}
          className="flex items-center gap-2 bg-krakedblue/30 hover:bg-krakedblue/70 text-white px-2 md:px-6 py-3 border border-gray-800 font-normal transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Room
        </button>
      </div>

      {/* Empty State / Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-gray-800 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Rooms Yet</h2>
            <p className="text-gray-400 mb-6">
              Create your first study room or join an existing one to start
              studying together!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/rooms/new")}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Room
              </button>
              <button
                onClick={() => router.push("/rooms/new?tab=join")}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 font-semibold transition-colors"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Rooms Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rooms.map((room) => (
            <Link
              key={room.code}
              href={`/rooms/${room.code}`}
              className="group bg-krakedblue/20 border border-gray-800 p-6 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10"
            >
              {/* Room Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="font-mono text-green-400">
                      {room.code}
                    </span>
                  </div>
                </div>

                {room.isHost && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 font-medium">
                    Host
                  </span>
                )}
              </div>

              {/* Room Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {room.memberCount}{" "}
                    {room.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Joined{" "}
                    {new Date(room.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Enter Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-sm text-gray-400 group-hover:text-green-400 transition-colors">
                  View Room
                </span>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}

          {/* Add New Room Card */}
          <button
            onClick={() => router.push("/rooms/new")}
            className="bg-[#1a1a1a] border-2 border-dashed border-gray-700 p-6 hover:border-green-500/50 transition-all hover:bg-gray-900/50 flex flex-col items-center justify-center min-h-[200px] group"
          >
            <div className="w-12 h-12 bg-green-500/20 flex items-center justify-center mb-3 group-hover:bg-green-500/30 transition-colors">
              <Plus className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-lg font-semibold text-gray-300 group-hover:text-green-400 transition-colors">
              Create New Room
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Start studying together
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
