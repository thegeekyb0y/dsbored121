"use client";

import LiveTimer from "@/app/components/LiveTimer";
import { usePusher } from "@/app/hooks/usePusher";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react"; // 1. Added useCallback

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

interface ActiveSessionState {
  startedAt: string;
  tag: string;
  completedToday: number;
  isPaused: boolean;
  pausedAt: string | null;
}

// 2. Interface to fix the Pusher 'session-started' any error (Line 83)
interface SessionStartedData {
  userId: string;
  startedAt: string;
  tag: string;
  completedToday: number;
}

// 3. Interface to fix the fetchActiveSessions 'any' error (Line 185)
interface ActiveSession extends ActiveSessionState {
  userId: string;
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
  studyDurationToday: Record<string, number>;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function RoomPage() {
  const params = useParams();
  const { data: session } = useSession();
  const code = params.code as string;
  const { channel } = usePusher(`room-${code}`);

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSessions, setActiveSessions] = useState<
    Map<string, ActiveSessionState>
  >(new Map());

  const [studyDurations, setStudyDurations] = useState<Record<string, number>>(
    {}
  );

  // 4. Wrapped fetch functions in useCallback to fix react-hooks/exhaustive-deps warning
  const fetchRoomData = useCallback(async () => {
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
  }, [code]);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${code}/active`);
      const data = await response.json();

      if (response.ok && data.activeSessions) {
        const sessionsMap = new Map<string, ActiveSessionState>(); // Added Map types

        // 5. Replaced 'any' with ActiveSession type (Fixes Error on original Line 185)
        data.activeSessions.forEach((s: ActiveSession) => {
          sessionsMap.set(s.userId, {
            startedAt: s.startedAt,
            tag: s.tag,
            completedToday: s.completedToday,
            isPaused: s.isPaused,
            pausedAt: s.pausedAt,
          });
          // Update local study durations map from initial fetch data
          setStudyDurations((prev) => ({
            ...prev,
            [s.userId]: data.studyDurationToday[s.userId] || 0, // Use the separate studyDurationToday map
          }));
        });
        setActiveSessions(sessionsMap);

        // Also ensure study durations for offline members are initialized
        setStudyDurations((prev) => ({
          ...prev,
          ...data.studyDurationToday,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch active sessions:", error);
    }
  }, [code]); // Dependencies include 'code' and state setters

  useEffect(() => {
    // Initialize/Update member study durations from the initial fetch
    if (roomData?.studyDurationToday) {
      setStudyDurations(roomData.studyDurationToday);
    }
  }, [roomData]);

  useEffect(() => {
    // 6. Included fetch functions in dependency array (Fixes React Hook warning on original Line 77)
    fetchRoomData();
    fetchActiveSessions();
  }, [code, fetchRoomData, fetchActiveSessions]);

  useEffect(() => {
    if (!channel) return;

    // --- Start Listener ---
    // 7. Replaced 'any' with SessionStartedData type (Fixes Error on original Line 83)
    channel.bind("session-started", (data: SessionStartedData) => {
      setActiveSessions((prev) => {
        const updated = new Map(prev);
        updated.set(data.userId, {
          startedAt: data.startedAt,
          tag: data.tag,
          completedToday: data.completedToday,
          isPaused: false,
          pausedAt: null,
        });
        return updated;
      });
    });

    // --- Stop Listener ---
    channel.bind(
      "session-stopped",
      (data: { userId: string; duration: number; tag: string }) => {
        setActiveSessions((prev) => {
          const updated = new Map(prev);
          updated.delete(data.userId);
          return updated;
        });
        // Update the total study duration upon session completion
        setStudyDurations((prev) => ({
          ...prev,
          [data.userId]: (prev[data.userId] || 0) + data.duration,
        }));
      }
    );

    // --- PAUSE Listener ---
    channel.bind(
      "session-paused",
      (data: { userId: string; pausedAt: string }) => {
        setActiveSessions((prev) => {
          const updated = new Map(prev);
          const session = updated.get(data.userId);
          if (session) {
            updated.set(data.userId, {
              ...session,
              isPaused: true,
              pausedAt: data.pausedAt,
            });
          }
          return updated;
        });
      }
    );

    // --- RESUME Listener ---
    channel.bind(
      "session-resumed",
      (data: { userId: string; newStartedAt: string }) => {
        setActiveSessions((prev) => {
          const updated = new Map(prev);
          const session = updated.get(data.userId);
          if (session) {
            updated.set(data.userId, {
              ...session,
              startedAt: data.newStartedAt, // Crucial for client-side LiveTimer correction
              isPaused: false,
              pausedAt: null,
            });
          }
          return updated;
        });
      }
    );

    return () => {
      channel.unbind("session-started");
      channel.unbind("session-stopped");
      channel.unbind("session-paused");
      channel.unbind("session-resumed");
    };
  }, [channel]);

  // Original fetchRoomData and fetchActiveSessions functions are now the useCallback definitions above.

  if (loading) return <div>Loading room...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!roomData) return <div>Room not found</div>;

  const isHost = session?.user?.id === roomData.room.hostId;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomData.room.code);
    } else {
      // Fallback for non-secure contexts or older browsers
      const el = document.createElement("textarea");
      el.value = roomData.room.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-krakedbg shadow p-6 mb-6 rounded-lg">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold mb-2">{roomData.room.name}</h1>
          <p className="text-krakedblue2 mb-4">
            Room Code: {roomData.room.code}
          </p>
        </div>
        {isHost && (
          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Host
          </span>
        )}

        <div className="mt-2">
          <p className="text-sm text-krakedlight">
            Share this code with others to invite them!
          </p>
          <button
            onClick={handleCopy}
            className="mt-2 bg-krakedblue px-4 py-2 rounded-lg text-white hover:bg-krakedblue/80 transition"
          >
            Copy Room Code
          </button>
        </div>
      </div>

      <div className="bg-krakedbg shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Members ({roomData.members.length})
        </h2>

        <div className="space-y-3">
          {roomData.members.map((member) => {
            const activeSession = activeSessions.get(member.user.id);
            const isActive = !!activeSession && !activeSession.isPaused;
            const isPaused = !!activeSession && activeSession.isPaused;
            // Get today's total study duration (for active and offline users)
            const studyDuration = studyDurations[member.user.id] || 0;
            const isSelf = session?.user?.id === member.user.id;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-3 transition-colors rounded-lg ${
                  isSelf
                    ? "bg-krakedblue/80 border border-krakedyellow"
                    : "bg-krakedblue/60"
                }`}
              >
                {/* Status dot */}
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    isActive
                      ? "bg-green-500 animate-pulse"
                      : isPaused
                      ? "bg-yellow-500" // Yellow for paused
                      : "bg-gray-500" // Gray for offline
                  }`}
                  title={isActive ? "Active" : isPaused ? "Paused" : "Offline"}
                />

                {member.user.image ? (
                  <Image
                    src={member.user.image}
                    alt={member.user.name || "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized={true} // Assuming external images might not need optimization
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {member.user.name ? member.user.name[0] : "U"}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-white">
                    {member.user.name || "Unknown"}
                    {isSelf && (
                      <span className="ml-2 text-xs text-krakedyellow">
                        (You)
                      </span>
                    )}
                  </p>

                  {isActive ? (
                    <div className="flex items-center gap-2">
                      {/* LiveTimer handles the running count and starts from completedToday */}
                      <LiveTimer
                        startedAt={activeSession.startedAt}
                        completedToday={activeSession.completedToday}
                        className="text-green-400 font-semibold text-sm"
                      />
                      <span className="text-gray-400">·</span>
                      <span className="text-xs text-gray-400">
                        {activeSession.tag}
                      </span>
                    </div>
                  ) : isPaused ? (
                    <p className="text-sm text-yellow-400">
                      Paused
                      <span className="ml-2 text-gray-400">
                        | Studied Today: {formatDuration(studyDuration)}
                      </span>
                    </p>
                  ) : (
                    // Offline with study time (Grey status, updated duration)
                    <p className="text-sm text-gray-500">
                      Offline
                      <span className="ml-2 text-gray-400">
                        | Studied Today: {formatDuration(studyDuration)}
                      </span>
                    </p>
                  )}
                </div>

                {member.user.id === roomData.room.hostId && (
                  <span className="ml-auto text-xs bg-krakedyellow text-gray-900 px-2 py-1 rounded-full shrink-0 font-medium">
                    Host
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
