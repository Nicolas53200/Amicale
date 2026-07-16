"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface Album {
  id: string;
  title: string;
  date: string;
  category: string | null;
}

const GRADIENTS = [
  "from-brand-500 to-orange-400",
  "from-red-500 to-amber-500",
  "from-sky-500 to-emerald-400",
  "from-purple-500 to-pink-400",
  "from-teal-500 to-cyan-400",
  "from-indigo-500 to-blue-400",
];

const categoryIcons: Record<string, string> = {
  repas: "🍴",
  bal: "🎵",
  sport: "🏆",
  ceremonie: "🎖️",
  sortie: "⛰️",
};

export default function GalerieBureauPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select("id, title, date, category")
        .lt("date", new Date().toISOString())
        .order("date", { ascending: false })
        .limit(12);
      setAlbums(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <GradientHeader
          title="Retour en images"
          subtitle="Photos des evenements"
          backHref="/bureau/dashboard"
        />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-[16px] bg-surface-secondary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Retour en images"
        subtitle="Photos des evenements"
        backHref="/bureau/dashboard"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => showToast("Creation d'album a venir", "info")}
          className="btn-gradient flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Creer un album
        </button>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Aucun album disponible"
          description="Creez votre premier album pour partager les photos d'un evenement"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {albums.map((album, i) => {
            const d = new Date(album.date);
            const icon = categoryIcons[album.category ?? ""] || "📷";
            return (
              <div
                key={album.id}
                className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm"
              >
                <div
                  className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                >
                  <span className="text-[32px]">{icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-content-primary">{album.title}</p>
                  <p className="mt-0.5 text-[12px] text-content-muted">
                    {d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => showToast("Upload de photos a venir", "info")}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-surface-secondary text-content-muted"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
