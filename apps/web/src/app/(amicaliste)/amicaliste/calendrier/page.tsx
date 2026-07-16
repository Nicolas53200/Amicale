"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: string | null;
  type: "event";
}

interface CalendarTrip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  type: "trip";
}

type CalendarItem = CalendarEvent | CalendarTrip;

const MONTHS_FR = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendrierPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

      const [eventsRes, tripsRes] = await Promise.all([
        supabase
          .from("events")
          .select("id, title, date, category")
          .gte("date", startOfMonth)
          .lte("date", endOfMonth)
          .order("date"),
        supabase
          .from("trips")
          .select("id, destination, start_date, end_date")
          .or(`start_date.lte.${endOfMonth},end_date.gte.${startOfMonth}`)
          .order("start_date"),
      ]);

      const events: CalendarItem[] = (eventsRes.data ?? []).map((e) => ({
        ...e,
        type: "event" as const,
      }));

      const trips: CalendarItem[] = (tripsRes.data ?? []).map((t) => ({
        ...t,
        type: "trip" as const,
      }));

      setItems([...events, ...trips]);
    }
    load();
  }, [currentMonth, currentYear]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};
    for (const item of items) {
      if (item.type === "event") {
        const key = item.date.slice(0, 10);
        (map[key] ??= []).push(item);
      } else {
        const start = new Date(item.start_date);
        const end = new Date(item.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().slice(0, 10);
          (map[key] ??= []).push(item);
        }
      }
    }
    return map;
  }, [items]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  }

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] ?? []) : [];

  const uniqueSelectedItems = selectedItems.filter(
    (item, idx, arr) => arr.findIndex((i) => i.id === item.id && i.type === item.type) === idx
  );

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Calendrier"
        subtitle="Evenements et voyages"
        backHref="/amicaliste/accueil"
      />

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary transition-colors hover:bg-surface-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-primary">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h3 className="text-[15px] font-bold text-content-primary">
            {MONTHS_FR[currentMonth]} {currentYear}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary transition-colors hover:bg-surface-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-primary">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS_FR.map((day) => (
            <div key={day} className="text-center text-[11px] font-semibold text-content-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasItems = !!itemsByDate[dateStr];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayItems = itemsByDate[dateStr] ?? [];
            const hasEvent = dayItems.some((it) => it.type === "event");
            const hasTrip = dayItems.some((it) => it.type === "trip");

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex h-10 flex-col items-center justify-center rounded-[10px] text-[13px] font-medium transition-all ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-sm"
                    : isToday
                      ? "bg-brand-50 font-bold text-brand-600 dark:bg-brand-500/10"
                      : hasItems
                        ? "text-content-primary hover:bg-surface-secondary"
                        : "text-content-muted hover:bg-surface-secondary"
                }`}
              >
                {day}
                {hasItems && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {hasEvent && (
                      <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-brand-500"}`} />
                    )}
                    {hasTrip && (
                      <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-white/70" : "bg-blue-500"}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            <span className="text-[11px] text-content-muted">Evenement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] text-content-muted">Voyage</span>
          </div>
        </div>
      </div>

      {/* Selected date items */}
      {selectedDate && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {uniqueSelectedItems.length === 0 ? (
            <p className="py-2 text-center text-[13px] text-content-muted">
              Rien de prevu ce jour
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {uniqueSelectedItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={
                    item.type === "event"
                      ? `/amicaliste/evenements/${item.id}`
                      : `/amicaliste/voyages/${item.id}`
                  }
                  className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors hover:bg-surface-primary"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      item.type === "event"
                        ? "bg-brand-50 dark:bg-brand-500/10"
                        : "bg-blue-50 dark:bg-blue-500/10"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={item.type === "event" ? "text-brand-600" : "text-blue-600"}
                    >
                      {item.type === "event" ? (
                        <>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </>
                      ) : (
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-content-primary">
                      {item.type === "event" ? item.title : item.destination}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {item.type === "event"
                        ? item.category ?? "Evenement"
                        : `Voyage · ${new Date(item.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} → ${new Date(item.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
                    </p>
                  </div>
                  <Badge variant={item.type === "event" ? "default" : "neutral"}>
                    {item.type === "event" ? "Evenement" : "Voyage"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
