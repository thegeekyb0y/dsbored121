import { pusherServer } from "@/app/lib/pusher";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await pusherServer.trigger("test-channel", "test-event", {
      message: "Hello from server!",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
