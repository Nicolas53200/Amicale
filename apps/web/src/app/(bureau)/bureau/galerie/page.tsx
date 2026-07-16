import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";

const albums = [
  {
    name: "Bal annuel 2026",
    date: "15 mars 2026",
    count: 48,
    gradient: "from-brand-500 to-orange-400",
  },
  {
    name: "Sainte-Barbe 2025",
    date: "4 décembre 2025",
    count: 32,
    gradient: "from-red-500 to-amber-500",
  },
  {
    name: "Kermesse d'été 2025",
    date: "21 juin 2025",
    count: 65,
    gradient: "from-sky-500 to-emerald-400",
  },
];

export default function GalerieBureauPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Retour en images"
        subtitle="Photos des événements"
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
          Créer un album
        </button>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Aucun album disponible"
          description="Créez votre premier album pour partager les photos d'un événement"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {albums.map((album) => (
            <div
              key={album.name}
              className="group relative aspect-[4/3] overflow-hidden rounded-[16px] shadow-sm"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${album.gradient}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[13px] font-bold text-white">
                  {album.name}
                </p>
                <p className="text-[11px] text-white/70">
                  {album.date} &middot; {album.count} photos
                </p>
              </div>
              <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-sm">📷</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="pb-4 text-center text-[11px] text-content-muted">
        Les photos sont ajoutées par le bureau après chaque événement
      </p>
    </div>
  );
}
