"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Album {
  id: string;
  title: string;
  description: string | null;
  date: string;
  cover_url: string | null;
  album_photos: { count: number }[];
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

const GRADIENTS = [
  "from-brand-500 to-orange-400",
  "from-red-500 to-amber-500",
  "from-sky-500 to-emerald-400",
  "from-purple-500 to-pink-400",
  "from-teal-500 to-cyan-400",
  "from-indigo-500 to-blue-400",
];

export default function GaleriePage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("photo_albums")
        .select("id, title, description, date, cover_url, album_photos(count)")
        .order("date", { ascending: false });
      setAlbums((data as Album[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function openAlbum(album: Album) {
    setSelectedAlbum(album);
    setLoadingPhotos(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("album_photos")
      .select("id, url, caption")
      .eq("album_id", album.id)
      .order("created_at");
    setPhotos(data ?? []);
    setLoadingPhotos(false);
  }

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
          description="Les albums photos apparaitront ici apres chaque evenement"
        />
      ) : (
        <>
          {/* Hero album (most recent) */}
          {(() => {
            const hero = albums[0];
            if (!hero) return null;
            const hd = new Date(hero.date);
            const photoCount = ((hero.album_photos as unknown as { count: number }[])?.[0]?.count || 0);
            return (
              <button
                type="button"
                onClick={() => openAlbum(hero)}
                className="w-full text-left"
              >
                <div className="overflow-hidden rounded-[20px] shadow-sm">
                  <div
                    className={cn(
                      "relative flex min-h-[170px] items-end p-4",
                      hero.cover_url ? "" : `bg-gradient-to-br ${GRADIENTS[0]}`
                    )}
                    style={
                      hero.cover_url
                        ? { backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), transparent), url(${hero.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  >
                    {!hero.cover_url && (
                      <div className="absolute right-4 top-4 text-[54px] opacity-[0.18]">📷</div>
                    )}
                    <div>
                      <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        Souvenir recent
                      </span>
                      <p className="text-xl font-extrabold leading-tight text-white">
                        {hero.title}
                      </p>
                      <p className="mt-1 text-[12px] text-white/80">
                        {hd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        {photoCount > 0 && ` · ${photoCount} photo${photoCount > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })()}

          {/* Albums list */}
          {albums.length > 1 && (
            <>
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-content-secondary">
                Albums disponibles
              </h3>
              <div className="flex flex-col gap-2">
                {albums.slice(1).map((album, i) => {
                  const d = new Date(album.date);
                  const photoCount = ((album.album_photos as unknown as { count: number }[])?.[0]?.count || 0);
                  return (
                    <button
                      type="button"
                      key={album.id}
                      onClick={() => openAlbum(album)}
                      className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 text-left shadow-sm transition-colors active:bg-surface-secondary"
                    >
                      <div
                        className={cn(
                          "flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[16px]",
                          album.cover_url ? "" : `bg-gradient-to-br ${GRADIENTS[(i + 1) % GRADIENTS.length]}`
                        )}
                        style={
                          album.cover_url
                            ? { backgroundImage: `url(${album.cover_url})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "16px" }
                            : undefined
                        }
                      >
                        {!album.cover_url && <span className="text-[32px]">📷</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-content-primary">{album.title}</p>
                        <p className="mt-0.5 text-[12px] text-content-muted">
                          {d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                          {photoCount} photo{photoCount !== 1 ? "s" : ""} · Voir l&apos;album
                        </p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </>
          )}

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

      {/* Album detail modal */}
      {selectedAlbum && (
        <div
          className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => { setSelectedAlbum(null); setViewingPhoto(null); }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[20px] bg-surface-elevated p-5 shadow-xl sm:rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-content-primary">{selectedAlbum.title}</h3>
                <p className="text-[12px] text-content-muted">
                  {new Date(selectedAlbum.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {selectedAlbum.description && (
                  <p className="mt-1 text-[12px] text-content-secondary">{selectedAlbum.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setSelectedAlbum(null); setViewingPhoto(null); }}
                className="rounded-full p-1.5 hover:bg-surface-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {loadingPhotos ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : photos.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-content-muted">
                Aucune photo dans cet album
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <button
                    type="button"
                    key={photo.id}
                    onClick={() => setViewingPhoto(photo)}
                    className="aspect-square overflow-hidden rounded-[10px] bg-surface-secondary"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="h-full w-full object-cover transition-transform active:scale-95"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full photo viewer */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-[8500] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setViewingPhoto(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={viewingPhoto.url}
            alt={viewingPhoto.caption || ""}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {viewingPhoto.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-[13px] text-white backdrop-blur-sm">
              {viewingPhoto.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
