"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { uploadFile, buildPath, deleteFile } from "@/lib/storage";
import { updateAssetPhotos } from "@/lib/actions/assets";

interface PhotoManagerProps {
  assetId: string;
  orgId: string;
  initialPhotos: string[];
  initialCoverIndex: number | null;
}

const MAX_PHOTOS = 5;

export function PhotoManager({
  assetId,
  orgId,
  initialPhotos,
  initialCoverIndex,
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [coverIndex, setCoverIndex] = useState<number | null>(initialCoverIndex);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photos.length >= MAX_PHOTOS) return;

    setUploading(true);
    const path = buildPath(orgId, `assets/${assetId}`, file);
    const url = await uploadFile("assets", path, file);

    if (url) {
      const newPhotos = [...photos, url];
      setPhotos(newPhotos);
      await updateAssetPhotos(assetId, newPhotos, coverIndex);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(index: number) {
    const url = photos[index]!;
    const newPhotos = photos.filter((_, i) => i !== index);

    let newCover = coverIndex;
    if (coverIndex === index) newCover = null;
    else if (coverIndex != null && coverIndex > index) newCover = coverIndex - 1;

    setPhotos(newPhotos);
    setCoverIndex(newCover);
    await updateAssetPhotos(assetId, newPhotos, newCover);

    const pathMatch = url.match(/\/assets\/(.+)$/);
    if (pathMatch) {
      await deleteFile("assets", [pathMatch[1]!]);
    }
  }

  async function handleSetCover(index: number) {
    setCoverIndex(index);
    await updateAssetPhotos(assetId, photos, index);
  }

  return (
    <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-content-primary">
          Photos ({photos.length}/{MAX_PHOTOS})
        </h3>
        {photos.length < MAX_PHOTOS && (
          <label
            className={cn(
              "cursor-pointer rounded-full bg-brand-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity",
              uploading && "pointer-events-none opacity-50"
            )}
          >
            {uploading ? "Envoi..." : "+ Ajouter"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-content-muted">
          Aucune photo ajoutée
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((url, i) => (
            <div
              key={url}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-[12px] border-2 transition-colors",
                coverIndex === i
                  ? "border-brand-500"
                  : "border-transparent"
              )}
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="h-full w-full object-cover"
              />

              {coverIndex === i && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold text-white">
                  Couverture
                </span>
              )}

              <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {coverIndex !== i && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(i)}
                    className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-content-primary"
                  >
                    Couverture
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-semibold text-white"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
