"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface CarouselItem {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  type: "event" | "trip";
}

interface HeroCarouselProps {
  items: CarouselItem[];
  unreadMessages?: number;
  memberName?: string;
}

const slideColors = [
  "linear-gradient(135deg, rgba(142,128,56,0.9) 0%, rgba(168,140,50,0.8) 100%)",
  "linear-gradient(135deg, rgba(50,90,140,0.9) 0%, rgba(40,80,130,0.8) 100%)",
  "linear-gradient(135deg, rgba(130,60,90,0.9) 0%, rgba(150,60,80,0.8) 100%)",
  "linear-gradient(135deg, rgba(60,120,80,0.9) 0%, rgba(40,100,70,0.8) 100%)",
];

export function HeroCarousel({ items, unreadMessages = 0, memberName }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length || 1;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % total);
      }, 5000);
    }
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    touchRef.current.startX = touch.clientX;
    touchRef.current.startY = touch.clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      setCurrent((c) => (dx < 0 ? Math.min(c + 1, total - 1) : Math.max(c - 1, 0)));
      resetTimer();
    }
  }

  return (
    <div className="relative -mx-4 -mt-6 flex min-h-[55vh] flex-col bg-accent-gradient pt-[env(safe-area-inset-top)] md:min-h-0">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-4 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -right-12 top-32 h-32 w-32 rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-24 left-1/3 h-20 w-20 rounded-full bg-white/[0.06]" />
      </div>

      <div className="relative z-10 px-4">
        {/* Header row: greeting + icons */}
        <div className="flex items-center justify-between pb-3 pt-4">
          <div>
            <h1 className="text-[22px] font-bold text-white">
              Bonjour{memberName ? ` ${memberName}` : ""} <span className="inline-block">👋</span>
            </h1>
            <p className="text-[13px] text-white/70">Amicale SP</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/amicaliste/notifications" className="relative p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-transparent bg-white" />
            </Link>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
              <span className="text-xl">🚒</span>
            </div>
          </div>
        </div>

        {/* Messages card */}
        <Link
          href="/amicaliste/messagerie"
          className="mb-4 flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-content-primary">
              Messages
            </p>
            <p className="text-[12px] text-content-muted">
              {unreadMessages > 0
                ? `${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`
                : "Aucun nouveau message"}
            </p>
          </div>
          {unreadMessages > 0 && (
            <span className="shrink-0 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {unreadMessages}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-content-muted"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        {/* Carousel */}
        {items.length > 0 && (
          <div
            className="mb-1 overflow-hidden rounded-[16px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {items.map((item, i) => {
                const d = new Date(item.date);
                return (
                  <div
                    key={item.id}
                    className="relative w-full shrink-0 px-0.5"
                  >
                    <div
                      className="rounded-[16px] p-5"
                      style={{
                        background: slideColors[i % slideColors.length],
                        minHeight: "170px",
                      }}
                    >
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        {d.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <h3 className="mt-5 text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] text-white/80">
                        {d.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {item.location && ` · ${item.location}`}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Link
                          href={`/amicaliste/${item.type === "trip" ? "voyages" : "evenements"}/${item.id}`}
                          className="rounded-[10px] bg-white px-4 py-2 text-[13px] font-semibold text-content-primary shadow-sm transition-transform active:scale-95"
                        >
                          Voir le détail →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            {items.length > 1 && (
              <div className="flex justify-center gap-1.5 py-3">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrent(i);
                      resetTimer();
                    }}
                    className={`h-[5px] rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-6 bg-white"
                        : "w-[5px] bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wave separator — pushed to bottom of gradient */}
      <svg
        className="relative z-10 -mb-px mt-auto block w-full"
        viewBox="0 0 1440 50"
        fill="none"
        preserveAspectRatio="none"
        style={{ height: "30px" }}
      >
        <path
          d="M0 50V25C200 5 400 0 720 15C1040 30 1240 10 1440 0V50H0Z"
          fill="var(--color-surface-secondary)"
        />
      </svg>
    </div>
  );
}
