"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";

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

export default function GalerieBureauPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

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
        <button className="btn-gradient flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-semibold text-white">
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
          >
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
        <div className="grid grid-cols-2 gap-3">
          {albums.map((album, i) => {
            const d = new Date(album.date);
            return (
              <div
                key={album.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-[16px] shadow-sm"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-[13px] font-bold text-white">
                    {album.title}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-sm">📷</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="pb-4 text-center text-[11px] text-content-muted">
        Les photos sont ajoutees par le bureau apres chaque evenement
      </p>
    </div>
  );
}
