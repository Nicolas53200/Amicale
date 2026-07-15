"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "event" | "trip" | "asset" | "member" | "commission";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: string;
}

const typeLabels: Record<string, string> = {
  event: "Événement",
  trip: "Voyage",
  asset: "Bien",
  member: "Membre",
  commission: "Commission",
};

export function SearchDialog({ basePath }: { basePath: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
    }
  }, [open]);

  async function search(q: string) {
    const supabase = createClient();
    const term = `%${q}%`;
    const items: SearchResult[] = [];

    const [eventsRes, tripsRes, assetsRes, membersRes, commissionsRes] = await Promise.all([
      supabase.from("events").select("id, title, date").ilike("title", term).limit(5),
      supabase.from("trips").select("id, destination, start_date").ilike("destination", term).limit(5),
      supabase.from("assets").select("id, name, type").ilike("name", term).limit(5),
      supabase.from("members").select("id, first_name, last_name, role").or(`first_name.ilike.${term},last_name.ilike.${term}`).limit(5),
      supabase.from("commissions").select("id, name, icon").ilike("name", term).eq("active", true).limit(5),
    ]);

    for (const ev of eventsRes.data ?? []) {
      items.push({
        type: "event",
        id: ev.id,
        title: ev.title,
        subtitle: new Date(ev.date).toLocaleDateString("fr-FR"),
        href: `${basePath === "/bureau" ? "/bureau/evenements" : "/amicaliste/evenements"}/${ev.id}`,
        icon: "🎉",
      });
    }
    for (const t of tripsRes.data ?? []) {
      items.push({
        type: "trip",
        id: t.id,
        title: t.destination,
        subtitle: new Date(t.start_date).toLocaleDateString("fr-FR"),
        href: `${basePath === "/bureau" ? "/bureau/voyages" : "/amicaliste/voyages"}/${t.id}`,
        icon: "✈️",
      });
    }
    for (const a of assetsRes.data ?? []) {
      items.push({
        type: "asset",
        id: a.id,
        title: a.name,
        subtitle: a.type,
        href: `${basePath === "/bureau" ? "/bureau/locations" : "/amicaliste/locations"}/${a.id}`,
        icon: "🏠",
      });
    }
    for (const m of membersRes.data ?? []) {
      items.push({
        type: "member",
        id: m.id,
        title: `${m.first_name} ${m.last_name}`,
        subtitle: m.role,
        href: basePath === "/bureau" ? "/bureau/membres" : "/amicaliste/profil",
        icon: "👤",
      });
    }
    for (const c of commissionsRes.data ?? []) {
      items.push({
        type: "commission",
        id: c.id,
        title: c.name,
        icon: c.icon || "📋",
        href: `${basePath === "/bureau" ? "/bureau/commissions" : "/amicaliste/commissions"}/${c.id}`,
      });
    }

    setResults(items);
  }

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(() => search(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [results]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      navigate(results[selectedIdx].href);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-border bg-surface-primary px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-secondary md:flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Rechercher...
        <kbd className="ml-4 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-content-muted">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-surface-elevated shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un événement, voyage, membre..."
            className="flex-1 bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
          />
          <kbd
            className="cursor-pointer rounded border border-border px-1.5 py-0.5 text-[10px] text-content-muted"
            onClick={() => setOpen(false)}
          >
            ESC
          </kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}`}
                type="button"
                onClick={() => navigate(r.href)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                  i === selectedIdx ? "bg-brand-50 dark:bg-brand-500/10" : "hover:bg-surface-secondary"
                )}
              >
                <span className="text-lg">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-content-primary">{r.title}</p>
                  {r.subtitle && (
                    <p className="text-xs text-content-muted">{r.subtitle}</p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-content-muted">
                  {typeLabels[r.type]}
                </span>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-content-muted">
            Aucun résultat pour &laquo; {query} &raquo;
          </div>
        )}
      </div>
    </div>
  );
}
