"use client";

import { useState } from "react";

export function LiteYouTube({
  videoId,
  title,
  className = "",
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-lg bg-black ${className}`}>
      {active ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play: ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          />
          <span className="absolute inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
