"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RoomsListPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (session) {
      const fetchMyRooms = async () => {
        const response = await fetch("/api/rooms/my-rooms");
        const data = await response.json();
        setRooms(data.rooms);
      };

      fetchMyRooms();
    }
  }, [session]);

  return (
    <div className="mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Study Rooms</h1>

      <div className="grid gap-4">
        {rooms.map((room: { id: string; code: string; name: string }) => (
          <Link
            key={room.code}
            href={`/rooms/${room.code}`}
            className="p-4 bg-gray-800 rounded hover:bg-gray-700"
          >
            <h3 className="font-bold">{room.name}</h3>
            <p className="text-sm text-gray-400">Code: {room.code}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
