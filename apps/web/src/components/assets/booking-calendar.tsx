"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  members: { first_name: string; last_name: string } | null;
}

export function BookingCalendar({ assetId }: { assetId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("asset_bookings")
        .select("id, start_date, end_date, status, members:member_id(first_name, last_name)")
        .eq("asset_id", assetId)
        .order("start_date");
      if (data) setBookings(data as unknown as Booking[]);
    }
    load();
  }, [assetId]);

  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  function isBooked(day: number) {
    const d = new Date(year, m, day);
    return bookings.find((b) => {
      const s = new Date(b.start_date);
      const e = new Date(b.end_date);
      return d >= s && d <= e;
    });
  }

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="rounded-lg bg-surface-elevated p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(year, m - 1))}
          className="rounded-lg px-2 py-1 text-sm text-content-muted hover:bg-surface-secondary"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold capitalize text-content-primary">
          {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          onClick={() => setMonth(new Date(year, m + 1))}
          className="rounded-lg px-2 py-1 text-sm text-content-muted hover:bg-surface-secondary"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-medium uppercase text-content-muted"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const booking = isBooked(day);
          return (
            <div
              key={day}
              className={cn(
                "flex h-8 items-center justify-center rounded text-xs tabular-nums",
                booking
                  ? booking.status === "validee"
                    ? "bg-red-100 font-medium text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-amber-100 font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                  : "text-content-secondary hover:bg-surface-secondary"
              )}
              title={
                booking
                  ? `${booking.members?.first_name} ${booking.members?.last_name} (${booking.status})`
                  : undefined
              }
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-3 text-[10px] text-content-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-red-200 dark:bg-red-500/30" />
          Réservé
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-amber-200 dark:bg-amber-500/30" />
          En attente
        </span>
      </div>
    </div>
  );
}
