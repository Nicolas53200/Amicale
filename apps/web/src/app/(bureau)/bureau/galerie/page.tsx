"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Album {
  id: string;
  title: string;
  description: string | null;
  date: string;
  cover_url: string | null;
  event_id: string | null;
  album_photos: { count: number }[];
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
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
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const loadAlbums = useCallback(async () => {
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const { data } = await supabase
      .from("photo_albums")
      .select("*, album_photos(count)")
      .eq("org_id", orgId)
      .order("date", { ascending: false });
    setAlbums((data as Album[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = (fd.get("description") as string) || null;
    const date = (fd.get("date") as string) || new Date().toISOString().split("T")[0];

    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const { data: { user } } = await supabase.auth.getUser();
    let memberId: string | null = null;
    if (user) {
      const { data: member } = await supabase.from("members").select("id").eq("user_id", user.id).single();
      memberId = member?.id ?? null;
    }

    const { error } = await supabase.from("photo_albums").insert({
      org_id: orgId,
      title,
      description,
      date,
      created_by: memberId,
    });

    setCreating(false);
    if (error) {
      showToast("Erreur lors de la creation", "error");
    } else {
      showToast("Album cree", "success");
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      await loadAlbums();
    }
  }

  async function openAlbum(album: Album) {
    setSelectedAlbum(album);
    setLoadingPhotos(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("album_photos")
      .select("id, url, caption, created_at")
      .eq("album_id", album.id)
      .order("created_at");
    setAlbumPhotos(data ?? []);
    setLoadingPhotos(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedAlbum || !e.target.files?.length) return;
    setUploading(true);
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const { data: { user } } = await supabase.auth.getUser();
    let memberId: string | null = null;
    if (user) {
      const { data: member } = await supabase.from("members").select("id").eq("user_id", user.id).single();
      memberId = member?.id ?? null;
    }

    let uploaded = 0;
    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${orgId}/albums/${selectedAlbum.id}/${Date.now()}_${uploaded}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);
      if (uploadError) continue;

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);

      await supabase.from("album_photos").insert({
        album_id: selectedAlbum.id,
        url: urlData.publicUrl,
        uploaded_by: memberId,
      });

      if (!selectedAlbum.cover_url && uploaded === 0) {
        await supabase
          .from("photo_albums")
          .update({ cover_url: urlData.publicUrl })
          .eq("id", selectedAlbum.id);
      }
      uploaded++;
    }

    setUploading(false);
    e.target.value = "";
    showToast(`${uploaded} photo${uploaded > 1 ? "s" : ""} ajoutee${uploaded > 1 ? "s" : ""}`, "success");
    await openAlbum(selectedAlbum);
    await loadAlbums();
  }

  async function handleDeletePhoto(photoId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("album_photos").delete().eq("id", photoId);
    if (error) {
      showToast("Erreur", "error");
    } else {
      setAlbumPhotos((prev) => prev.filter((p) => p.id !== photoId));
      showToast("Photo supprimee", "success");
    }
  }

  async function handleDeleteAlbum(albumId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("photo_albums").delete().eq("id", albumId);
    if (error) {
      showToast("Erreur lors de la suppression", "error");
    } else {
      showToast("Album supprime", "success");
      setSelectedAlbum(null);
      await loadAlbums();
    }
  }

  async function setCover(url: string) {
    if (!selectedAlbum) return;
    const supabase = createClient();
    await supabase.from("photo_albums").update({ cover_url: url }).eq("id", selectedAlbum.id);
    setSelectedAlbum({ ...selectedAlbum, cover_url: url });
    showToast("Couverture definie", "success");
    await loadAlbums();
  }

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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Albums</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{albums.length}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Photos</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">
            {albums.reduce((s, a) => s + ((a.album_photos as unknown as { count: number }[])?.[0]?.count || 0), 0)}
          </p>
        </div>
      </div>

      {/* New album toggle */}
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white transition-all",
          showForm ? "bg-gray-400 dark:bg-gray-600" : "btn-gradient"
        )}
      >
        {showForm ? "Annuler" : "+ Creer un album"}
      </button>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-4 text-[14px] font-bold text-content-primary">Nouvel album</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Titre</label>
              <Input name="title" placeholder="Repas annuel 2026" required />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date</label>
              <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Description</label>
              <Textarea name="description" rows={2} placeholder="Description optionnelle..." />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="btn-gradient rounded-[14px] py-3 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {creating ? "Creation..." : "Creer l'album"}
            </button>
          </div>
        </form>
      )}

      {/* Albums list */}
      {albums.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Aucun album"
          description="Creez votre premier album pour commencer"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {albums.map((album, i) => {
            const d = new Date(album.date);
            const photoCount = ((album.album_photos as unknown as { count: number }[])?.[0]?.count || 0);
            return (
              <button
                type="button"
                key={album.id}
                onClick={() => openAlbum(album)}
                className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 text-left shadow-sm transition-colors hover:bg-surface-secondary"
              >
                <div
                  className={cn(
                    "flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br",
                    GRADIENTS[i % GRADIENTS.length]
                  )}
                  style={
                    album.cover_url
                      ? { backgroundImage: `url(${album.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
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
                  <p className="mt-0.5 text-[11px] font-semibold text-brand-500">
                    {photoCount} photo{photoCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Album detail modal */}
      {selectedAlbum && (
        <div
          className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setSelectedAlbum(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[20px] bg-surface-elevated p-5 shadow-xl sm:rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
                onClick={() => setSelectedAlbum(null)}
                className="rounded-full p-1.5 hover:bg-surface-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Upload zone */}
            <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-border bg-surface-secondary p-4 transition-colors hover:border-brand-400">
              <span className="text-2xl">📤</span>
              <span className="text-[13px] font-semibold text-content-primary">
                {uploading ? "Upload en cours..." : "Ajouter des photos"}
              </span>
              <span className="text-[11px] text-content-muted">JPG, PNG, WebP</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>

            {/* Photos grid */}
            {loadingPhotos ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : albumPhotos.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-content-muted">
                Aucune photo dans cet album
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {albumPhotos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-[10px] bg-surface-secondary">
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setCover(photo.url)}
                        className="rounded-full bg-white/80 p-1 text-[10px]"
                        title="Definir comme couverture"
                      >
                        🖼️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="rounded-full bg-red-500/80 p-1 text-[10px] text-white"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleDeleteAlbum(selectedAlbum.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-red-50 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
              >
                Supprimer l&apos;album
              </button>
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="flex flex-1 items-center justify-center rounded-[12px] bg-surface-secondary py-2.5 text-[13px] font-medium text-content-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
