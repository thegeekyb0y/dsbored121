"use client";

import { usePusher } from "@/app/hooks/usePusher";
import { getAvatarById } from "@/lib/constants";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { RoomDetailSkeleton } from "@/app/components/RoomsSkeleton";
import LiveTimer from "@/app/components/LiveTimer";

interface Member {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    avatarId?: string | null;
  };
}

interface ActiveSessionState {
  startedAt: string;
  tag: string;
  completedToday: number;
  isPaused: boolean;
  pausedAt: string | null;
}

interface SessionStartedData {
  userId: string;
  startedAt: string;
  tag: string;
  completedToday: number;
}

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

// 櫨 Helper to determine which image to show
const getUserImage = (user: {
  image?: string | null;
  avatarId?: string | null;
}) => {
  if (user.avatarId) {
    const avatar = getAvatarById(user.avatarId);
    if (avatar) return avatar.src;
  }
  return user.image;
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
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
        const sessionsMap = new Map<string, ActiveSessionState>();

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
            [s.userId]: data.studyDurationToday[s.userId] || 0,
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
  }, [code]);

  useEffect(() => {
    // Initialize/Update member study durations from the initial fetch
    if (roomData?.studyDurationToday) {
      setStudyDurations(roomData.studyDurationToday);
    }
  }, [roomData]);

  useEffect(() => {
    fetchRoomData();
    fetchActiveSessions();
  }, [code, fetchRoomData, fetchActiveSessions]);

  useEffect(() => {
    if (!channel) return;

    // --- Start Listener ---
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
              startedAt: data.newStartedAt,
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

  if (loading) return <RoomDetailSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!roomData) return <div>Room not found</div>;

  const isHost = session?.user?.id === roomData.room.hostId;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomData.room.code);
    } else {
      const el = document.createElement("textarea");
      el.value = roomData.room.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px md:px-4 py-12">
      <div className="bg-krakedblue/20 border border-krakedlight/30 shadow p-2 md:p-6 mb-6 ">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="md:text-3xl text-lg font-bold">
              {roomData.room.name}
            </h1>
          </div>
          <p className="text-krakedblue2 md:block hidden p-2 mb-4">
            Room Code: {roomData.room.code}
          </p>
        </div>

        <div className="md:mt-2 px-2">
          <p className="md:text-lg text-sm text-krakedlight">
            Share this code to invite your friends!
          </p>
          <button
            onClick={handleCopy}
            className="mt-2 flex items-center justify-center gap-2 bg-krakedblue px-4 py-2 rounded-xs text-white hover:bg-blue-600 transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Room Code</span>
          </button>
        </div>
      </div>

      <div className="bg-krakedblue/20 shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Members ({roomData.members.length})
        </h2>

        <div className="space-y-3">
          {roomData.members.map((member) => {
            const activeSession = activeSessions.get(member.user.id);
            const isActive = !!activeSession && !activeSession.isPaused;
            const isPaused = !!activeSession && activeSession.isPaused;
            const studyDuration = studyDurations[member.user.id] || 0;
            const isSelf = session?.user?.id === member.user.id;

            const userImageSrc = getUserImage(member.user);

            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-3 transition-colors ${
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
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                  title={isActive ? "Active" : isPaused ? "Paused" : "Offline"}
                />

                {/* 櫨 UPDATED: Avatar Rendering */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 shrink-0">
                  {userImageSrc ? (
                    <Image
                      src={userImageSrc}
                      alt={member.user.name || "User"}
                      fill
                      className="object-cover"
                      unoptimized={true} // Keep for external/preset images
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">
                      {member.user.name ? member.user.name[0] : "U"}
                    </div>
                  )}
                </div>

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
                      <LiveTimer
                        startedAt={activeSession.startedAt}
                        completedToday={activeSession.completedToday}
                        className="text-green-400 font-semibold text-sm"
                      />
                      <span className="text-gray-400">ﾂｷ</span>
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
