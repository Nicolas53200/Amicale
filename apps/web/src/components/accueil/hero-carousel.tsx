"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface CarouselItem {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  type: "event" | "trip";
  color?: string | null;
}

interface HeroCarouselProps {
  items: CarouselItem[];
  unreadMessages?: number;
  memberName?: string;
}

function lightenColor(hex: string, pct: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * pct));
  const lg = Math.min(255, Math.round(g + (255 - g) * pct));
  const lb = Math.min(255, Math.round(b + (255 - b) * pct));
  return `rgb(${lr},${lg},${lb})`;
}

function slideBg(color: string | null | undefined, idx: number): string {
  if (color) {
    const light = lightenColor(color, 0.25);
    return `linear-gradient(to top, rgba(0,0,0,0.55), transparent), linear-gradient(135deg, ${light}, ${color})`;
  }
  const fallbacks = [
    "linear-gradient(to top, rgba(0,0,0,0.55), transparent), linear-gradient(135deg, rgba(142,128,56,0.9), rgba(168,140,50,0.8))",
    "linear-gradient(to top, rgba(0,0,0,0.55), transparent), linear-gradient(135deg, rgba(50,90,140,0.9), rgba(40,80,130,0.8))",
    "linear-gradient(to top, rgba(0,0,0,0.55), transparent), linear-gradient(135deg, rgba(130,60,90,0.9), rgba(150,60,80,0.8))",
    "linear-gradient(to top, rgba(0,0,0,0.55), transparent), linear-gradient(135deg, rgba(60,120,80,0.9), rgba(40,100,70,0.8))",
  ];
  return fallbacks[idx % fallbacks.length]!;
}

function timeBadge(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff > 1 && diff <= 30) return `Dans ${diff} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function HeroCarousel({ items, unreadMessages = 0, memberName }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0 });
  const dragRef = useRef({ startX: 0, dragging: false });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const total = items.length || 1;

  const goSlide = useCallback(
    (idx: number) => {
      setCurrent(((idx % total) + total) % total);
    },
    [total]
  );

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
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, startTime: Date.now() };
  }

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragOffset(dx);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    const elapsed = Date.now() - touchRef.current.startTime;
    setDragOffset(0);
    if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 50 || (elapsed < 300 && Math.abs(dx) > 20))) {
      goSlide(dx < 0 ? current + 1 : current - 1);
      resetTimer();
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, dragging: true };
    setIsDragging(true);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    setDragOffset(dx);
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    setIsDragging(false);
    const dx = e.clientX - dragRef.current.startX;
    setDragOffset(0);
    if (Math.abs(dx) > 50) {
      goSlide(dx < 0 ? current + 1 : current - 1);
      resetTimer();
    }
  }

  function handleMouseLeave() {
    if (dragRef.current.dragging) {
      dragRef.current.dragging = false;
      setIsDragging(false);
      setDragOffset(0);
    }
  }

  const translatePx = dragOffset ? dragOffset : 0;
  const translatePct = -current * 100;
  const transformStyle =
    translatePx !== 0
      ? `translateX(calc(${translatePct}% + ${translatePx}px))`
      : `translateX(${translatePct}%)`;

  return (
    <div className="relative -mx-4 -mt-6 flex flex-col bg-accent-gradient pt-[env(safe-area-inset-top)] md:min-h-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-4 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -right-12 top-32 h-32 w-32 rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-24 left-1/3 h-20 w-20 rounded-full bg-white/[0.06]" />
      </div>

      <div className="relative z-10 px-4">
        <div className="flex items-center justify-between pb-3 pt-4">
          <div>
            <h1 className="text-[26px] font-extrabold text-white">
              Bonjour{memberName ? ` ${memberName}` : ""} <span className="inline-block">👋</span>
            </h1>
            <p className="text-[14px] text-white/80">Amicale SP</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/amicaliste/notifications"
              className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/20 backdrop-blur-[8px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white" />
            </Link>
            <Link
              href="/amicaliste/profil"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/20 ring-2 ring-white/35"
            >
              <span className="text-xl">🚒</span>
            </Link>
          </div>
        </div>

        <Link
          href="/amicaliste/messagerie"
          className="mb-4 flex items-center gap-3 rounded-[16px] bg-[rgba(255,255,255,0.95)] p-3.5 shadow-sm dark:bg-surface-elevated"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-[0_4px_10px_rgba(255,107,53,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-content-primary">Messages</p>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        {items.length > 0 && (
          <div
            ref={carouselRef}
            className="mb-1 overflow-hidden rounded-[16px]"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex select-none"
              style={{
                transform: transformStyle,
                transition: dragOffset !== 0 ? "none" : "transform 0.3s ease-out",
              }}
            >
              {items.map((item, i) => (
                <div key={item.id} className="relative w-full shrink-0 px-0.5">
                  <div
                    className="rounded-[16px] p-5"
                    style={{
                      background: slideBg(item.color, i),
                      height: "clamp(200px, 50vw, 280px)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span className="mb-auto inline-block self-start rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                      {timeBadge(item.date)}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-[13px] text-white/80">
                      {new Date(item.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      {item.location && ` · ${item.location}`}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/amicaliste/${item.type === "trip" ? "voyages" : "evenements"}/${item.id}`}
                        className="rounded-[10px] bg-white px-4 py-2 text-[13px] font-semibold text-content-primary shadow-sm transition-transform active:scale-95"
                        onClick={(e) => e.stopPropagation()}
                        draggable={false}
                      >
                        Voir le detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 1 && (
              <div className="flex justify-center gap-1.5 py-3">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      goSlide(i);
                      resetTimer();
                    }}
                    className={`h-[6px] rounded-full transition-all duration-300 ${
                      i === current ? "w-[22px] bg-white" : "w-[6px] bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <svg
        className="relative z-10 -mb-px mt-auto block w-full"
        viewBox="0 0 1440 120"
        fill="none"
        preserveAspectRatio="none"
        style={{ height: "40px" }}
      >
        <path
          d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z"
          fill="var(--color-surface-secondary)"
        />
      </svg>
    </div>
  );
}
