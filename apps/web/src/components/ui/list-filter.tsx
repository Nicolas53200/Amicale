"use client";

import { useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface FilterTab {
  label: string;
  value: string;
}

interface ListFilterProps {
  searchPlaceholder?: string;
  tabs?: FilterTab[];
  onSearchChange: (query: string) => void;
  onTabChange?: (value: string) => void;
  activeTab?: string;
}

export function ListFilter({
  searchPlaceholder = "Rechercher...",
  tabs,
  onSearchChange,
  onTabChange,
  activeTab,
}: ListFilterProps) {
  const [search, setSearch] = useState("");

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    onSearchChange(e.target.value);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-xs">
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
          className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <Input
          value={search}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      {tabs && tabs.length > 0 && (
        <div className="flex gap-1 rounded-lg bg-surface-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange?.(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-surface-elevated text-content-primary shadow-sm"
                  : "text-content-muted hover:text-content-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
