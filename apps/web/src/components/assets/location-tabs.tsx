"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "biens", icon: "🏠", label: "Biens" },
  { id: "calendrier", icon: "📅", label: "Calendrier" },
  { id: "demandes", icon: "📋", label: "Demandes" },
  { id: "suivi", icon: "📊", label: "Suivi" },
  { id: "compta", icon: "💰", label: "Compta" },
];

export function LocationTabs() {
  const [active, setActive] = useState("biens");

  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
              active === tab.id
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-surface-elevated text-content-secondary"
            )}
          >
            <span className="text-[14px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
