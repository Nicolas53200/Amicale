"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createAsset, updateAsset } from "@/lib/actions/assets";

interface AssetData {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  daily_rate: number;
  deposit: number;
  rules?: string | null;
  icon?: string | null;
  color?: string | null;
  capacity?: number | null;
  status?: string | null;
  tags?: string[] | null;
}

export function AssetForm({ asset }: { asset?: AssetData }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(asset?.tags ?? []);
  const [newTag, setNewTag] = useState("");
  const isEdit = !!asset;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("tags", JSON.stringify(tags));
    if (isEdit) {
      await updateAsset(asset.id, fd);
      router.push(`/bureau/locations/${asset.id}`);
    } else {
      await createAsset(fd);
      router.push("/bureau/locations");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Informations
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Nom</label>
              <Input name="name" required placeholder="Appartement Lacanau, Barnum..." defaultValue={asset?.name} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Type</label>
              <Select name="type" required defaultValue={asset?.type ?? "appartement"}>
                <option value="appartement">Appartement</option>
                <option value="barnum">Barnum</option>
                <option value="remorque">Remorque</option>
                <option value="camping">Camping-car</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Description du bien..." defaultValue={asset?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Icone</label>
              <Input name="icon" placeholder="ti-home" defaultValue={asset?.icon ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Couleur</label>
              <Input name="color" type="color" defaultValue={asset?.color ?? "#3478F6"} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Tarification
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Tarif journalier</label>
              <Input name="daily_rate" type="number" step="0.01" required placeholder="0.00" defaultValue={asset?.daily_rate ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Caution</label>
              <Input name="deposit" type="number" step="0.01" placeholder="0.00" defaultValue={asset?.deposit ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Capacite (personnes)</label>
              <Input name="capacity" type="number" placeholder="Illimite" defaultValue={asset?.capacity ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Statut</label>
              <Select name="status" defaultValue={asset?.status ?? "disponible"}>
                <option value="disponible">Disponible</option>
                <option value="reserve">Reserve</option>
                <option value="maintenance">Maintenance</option>
                <option value="indisponible">Indisponible</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Details
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Reglement interieur</label>
            <Textarea name="rules" placeholder="Conditions d'utilisation..." defaultValue={asset?.rules ?? ""} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((_, j) => j !== i))}
                    className="text-brand-500 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Bord de mer, Piscine..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newTag.trim()) {
                      setTags((prev) => [...prev, newTag.trim()]);
                      setNewTag("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newTag.trim()) {
                    setTags((prev) => [...prev, newTag.trim()]);
                    setNewTag("");
                  }
                }}
                className="rounded-[10px] bg-brand-100 px-3 text-[12px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-[14px] bg-surface-elevated px-4 py-3 text-[13px] font-semibold text-content-primary shadow-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
        >
          {submitting
            ? isEdit ? "Enregistrement..." : "Creation..."
            : isEdit ? "Enregistrer" : "Ajouter le bien"
          }
        </button>
      </div>
    </form>
  );
}
