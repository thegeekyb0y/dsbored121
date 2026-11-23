"use client";

import { useEffect, useState } from "react";
import PusherClient, { Channel } from "pusher-js";

export function usePusher(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      // Room channels are private: every subscription is authorised by
      // /api/pusher/auth, which checks room membership for the signed-in user.
      channelAuthorization: {
        transport: "ajax",
        endpoint: "/api/pusher/auth",
        customHandler: (params, callback) => {
          fetch("/api/pusher/auth", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              socket_id: params.socketId,
              channel_name: params.channelName,
            }).toString(),
          })
            .then((response) =>
              response.ok
                ? response.json()
                : Promise.reject(new Error(`auth failed (${response.status})`))
            )
            .then((data) => callback(null, data))
            .catch((error) => callback(error as Error, null));
        },
      },
    });

    const ch = pusher.subscribe(channelName);

    // Defer setState to next tick
    const timer = setTimeout(() => setChannel(ch), 0);

    return () => {
      clearTimeout(timer);
      ch.unsubscribe();
      pusher.disconnect();
    };
  }, [channelName]);

  return { channel };
}
