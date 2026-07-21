"use client";

import { useState, useMemo } from "react";
import { EventCard } from "./event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  price: number;
  max_attendees: number | null;
  category: string | null;
  event_registrations: { count: number }[];
  icon: string | null;
  color: string | null;
  published: boolean;
}

const categoryConfig: { value: string; label: string; icon: string }[] = [
  { value: "all", label: "Tous", icon: "📋" },
  { value: "repas", label: "Repas", icon: "🍴" },
  { value: "sport", label: "Sport", icon: "⚽" },
  { value: "bal", label: "Bal", icon: "🎵" },
  { value: "sortie", label: "Sortie", icon: "⛰️" },
  { value: "ceremonie", label: "Cérémonie", icon: "🎖️" },
];

export function EventsListClient({ events }: { events: EventItem[] }) {
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    if (category === "all") return events;
    return events.filter((e) => e.category?.toLowerCase() === category);
  }, [events, category]);

  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category?.toLowerCase()).filter(Boolean));
    return categoryConfig.filter((c) => c.value === "all" || cats.has(c.value));
  }, [events]);

  return (
    <div className="flex flex-col gap-4">
      {/* Category filters */}
      {categories.length > 2 && (
        <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                  category === cat.value
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-surface-elevated text-content-secondary"
                )}
              >
                <span className="text-[14px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🎉"
          title={category !== "all" ? "Aucun événement dans cette catégorie" : "Aucun événement à venir"}
          description="Les prochains événements apparaîtront ici"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              id={e.id}
              title={e.title}
              date={e.date}
              location={e.location}
              description={e.description}
              imageUrl={e.image_url}
              icon={e.icon}
              color={e.color}
              published={e.published}
            />
          ))}
        </div>
      )}
    </div>
  );
}
