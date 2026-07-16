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

export default function GaleriePage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Retour en images"
        subtitle="Photos des événements"
        backHref="/amicaliste/accueil"
      />

      {albums.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Aucun album disponible"
          description="Les albums photos apparaîtront ici après chaque événement"
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
