"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";

export function usePusher(channelName: string) {
  const pusherRef = useRef<PusherClient | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const pusherChannel = pusherClient.subscribe(channelName);

    pusherRef.current = pusherClient;
    channelRef.current = pusherChannel;

    return () => {
      pusherChannel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [channelName]);

  return { pusher: pusherRef.current, channel: channelRef.current };
}
