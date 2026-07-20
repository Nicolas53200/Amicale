"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PhotoCarouselProps {
  photos: string[];
  coverIndex?: number | null;
}

export function PhotoCarousel({ photos, coverIndex }: PhotoCarouselProps) {
  const ordered = [...photos];
  if (coverIndex != null && coverIndex > 0 && coverIndex < ordered.length) {
    const cover = ordered.splice(coverIndex, 1)[0]!;
    ordered.unshift(cover);
  }

  const [current, setCurrent] = useState(0);

  if (ordered.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[16px]">
      <div className="relative aspect-[16/10] w-full bg-surface-secondary">
        <img
          src={ordered[current]}
          alt={`Photo ${current + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {ordered.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrent((p) => (p - 1 + ordered.length) % ordered.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrent((p) => (p + 1) % ordered.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {ordered.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
