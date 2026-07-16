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
}

export function AssetForm({ asset }: { asset?: AssetData }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!asset;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
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
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Tarif journalier</label>
              <Input name="daily_rate" type="number" step="0.01" required placeholder="0.00" defaultValue={asset?.daily_rate ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Caution</label>
              <Input name="deposit" type="number" step="0.01" placeholder="0.00" defaultValue={asset?.deposit ?? ""} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Règlement intérieur</label>
            <Textarea name="rules" placeholder="Conditions d'utilisation..." defaultValue={asset?.rules ?? ""} />
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
            ? isEdit ? "Enregistrement..." : "Création..."
            : isEdit ? "Enregistrer" : "Ajouter le bien"
          }
        </button>
      </div>
    </form>
  );
}
