"use client";

import { usePusher } from "@/app/hooks/usePusher";
import { useEffect, useState } from "react";

export default function TestPusherPage() {
  const { channel } = usePusher("test-channel");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!channel) return;

    channel.bind("test-event", (data: any) => {
      console.log("Received:", data);
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      channel.unbind("test-event");
    };
  }, [channel]);

  const sendTest = async () => {
    await fetch("/api/test-pusher", { method: "POST" });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pusher Test</h1>

      <button
        onClick={sendTest}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Send Test Message
      </button>

      <div className="space-y-2">
        <h2 className="font-semibold">Received Messages:</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Click the button!</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="p-2 bg-gray-100 rounded">
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
