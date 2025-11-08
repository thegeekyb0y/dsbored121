"use client";

import { useEffect, useState } from "react";
import PusherClient, { Channel } from "pusher-js";

export function usePusher(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
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
