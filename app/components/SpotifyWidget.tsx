"use client";

import React, { useMemo } from "react";

export default function SpotifyWidget({ url }: { url?: string | null }) {
  const embedUrl = useMemo(() => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);

      if (!urlObj.hostname.includes("spotify.com")) return null;

      if (urlObj.pathname.startsWith("/embed")) return url;

      return `https://open.spotify.com/embed${urlObj.pathname}`;
    } catch (e) {
      return null;
    }
  }, [url]);

  if (!embedUrl) return null;

  return (
    <div className="w-full max-w-sm mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <iframe
        style={{ borderRadius: "12px" }}
        src={embedUrl}
        width="100%"
        height="152"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="shadow-2xl border-0"
      />
    </div>
  );
}
