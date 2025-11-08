"use client";

import { useEffect, useState } from "react";
import PusherClient, { Channel } from "pusher-js";

export function usePusher(channelName: string) {
  const [pusher, setPusher] = useState<PusherClient | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const pusherChannel = pusherClient.subscribe(channelName);
    setPusher(pusherClient);
    setChannel(pusherChannel);

    return () => {
      pusherChannel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [channelName]);
  return { pusher, channel };
}
