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

export default function GaleriePage() {
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
          backHref="/amicaliste/accueil"
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
        backHref="/amicaliste/accueil"
      />

      {albums.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Aucun album disponible"
          description="Les albums photos apparaîtront ici après chaque événement"
        />
      ) : (
        <>
          {/* Hero album (most recent) */}
          {(() => {
            const hero = albums[0];
            if (!hero) return null;
            const hd = new Date(hero.date);
            return (
              <div className="overflow-hidden rounded-[20px] shadow-sm">
                <div
                  className={`relative flex min-h-[170px] items-end bg-gradient-to-br ${GRADIENTS[0]} p-4`}
                >
                  <div className="absolute right-4 top-4 text-[54px] opacity-[0.18]">
                    {categoryIcons[hero.category ?? ""] || "📷"}
                  </div>
                  <div>
                    <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                      Souvenir recent
                    </span>
                    <p className="text-xl font-extrabold leading-tight text-white">
                      {hero.title}
                    </p>
                    <p className="mt-1 text-[12px] text-white/80">
                      {hd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-[7px] bg-surface-elevated p-3">
                  {[
                    { icon: categoryIcons[hero.category ?? ""] || "📷", bg: "bg-brand-50 dark:bg-brand-500/10" },
                    { icon: "👥", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { icon: "🎉", bg: "bg-amber-50 dark:bg-amber-500/10" },
                  ].map((cell, ci) => (
                    <div
                      key={ci}
                      className={`flex h-16 items-center justify-center rounded-[12px] ${cell.bg}`}
                    >
                      <span className="text-[26px]">{cell.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Albums list */}
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-content-secondary">
            Albums disponibles
          </h3>
          <div className="flex flex-col gap-2">
            {albums.slice(1).map((album, i) => {
              const d = new Date(album.date);
              const icon = categoryIcons[album.category ?? ""] || "📷";
              return (
                <div
                  key={album.id}
                  className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm"
                >
                  <div
                    className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${GRADIENTS[(i + 1) % GRADIENTS.length]}`}
                  >
                    <span className="text-[32px]">{icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-content-primary">{album.title}</p>
                    <p className="mt-0.5 text-[12px] text-content-muted">
                      {d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                      Voir l&apos;album
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Contribuer section */}
          <div className="rounded-[16px] bg-surface-secondary p-4">
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
              Contribuer a un album
            </h3>
            <div className="mb-3 rounded-[12px] border-2 border-dashed border-border bg-surface-elevated p-4 text-center">
              <span className="mb-2 block text-2xl">📤</span>
              <p className="text-[13px] font-semibold text-content-primary">
                Ajouter mes photos
              </p>
              <p className="mt-1 text-[11px] text-content-muted">
                Elles seront envoyees au bureau pour validation avant publication
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast("Demande d'ajout de photos envoyee au bureau", "success")}
              className="btn-gradient w-full rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
            >
              Proposer mes photos
            </button>
          </div>
        </>
      )}
    </div>
  );
}
