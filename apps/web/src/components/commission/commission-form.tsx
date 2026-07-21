"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createCommission, updateCommission } from "@/lib/actions/commissions";
import { cn } from "@/lib/utils";

const MODELS = [
  { value: "simple", label: "Simple", desc: "Notifications, documents, comptabilité" },
  { value: "evenement", label: "Événements", desc: "Gestion d'événements + inscriptions" },
  { value: "location", label: "Locations", desc: "Biens locatifs + calendrier" },
  { value: "voyage", label: "Voyages", desc: "Voyages + inscriptions + paiements" },
  { value: "bons", label: "Bons cadeaux", desc: "Gestion de bons et cartes" },
];

const FEATURES = [
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "carousel", label: "Carousel", icon: "🎠" },
  { id: "evenements", label: "Événements", icon: "🎉" },
  { id: "locations", label: "Locations", icon: "🏠" },
  { id: "voyages", label: "Voyages", icon: "✈️" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "compta", label: "Comptabilité", icon: "💰" },
  { id: "membres", label: "Membres", icon: "👥" },
  { id: "bons_cadeaux", label: "Bons cadeaux", icon: "🎁" },
];

const MODEL_FEATURES: Record<string, string[]> = {
  simple: ["notifications", "documents", "compta", "membres"],
  evenement: ["notifications", "carousel", "evenements", "documents", "compta", "membres"],
  location: ["notifications", "locations", "documents", "compta", "membres"],
  voyage: ["notifications", "voyages", "documents", "compta", "membres"],
  bons: ["notifications", "bons_cadeaux", "documents", "compta", "membres"],
};

const ICONS = ["📋", "🎉", "🏠", "✈️", "🎁", "⚽", "🎄", "🤝", "☕", "🎵", "📦", "🛡️"];

const COLORS = [
  "#FF6B35", "#3B82F6", "#10B981", "#8B5CF6",
  "#F59E0B", "#EF4444", "#EC4899", "#06B6D4",
];

interface CommissionData {
  id: string;
  name: string;
  description?: string | null;
  model: string;
  icon?: string | null;
  color?: string | null;
  budget?: number | string | null;
  features?: string[] | null;
}

export function CommissionForm({ commission }: { commission?: CommissionData }) {
  const router = useRouter();
  const isEdit = !!commission;
  const [model, setModel] = useState(commission?.model || "simple");
  const [icon, setIcon] = useState(commission?.icon || "📋");
  const [color, setColor] = useState(commission?.color || "#FF6B35");
  const [features, setFeatures] = useState<string[]>(
    commission?.features ?? ["notifications", "documents", "compta", "membres"]
  );

  function handleModelChange(newModel: string) {
    setModel(newModel);
    if (!isEdit) {
      setFeatures(MODEL_FEATURES[newModel] ?? ["notifications", "documents", "compta", "membres"]);
    }
  }
  const [submitting, setSubmitting] = useState(false);

  function toggleFeature(f: string) {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("model", model);
    formData.set("icon", icon);
    formData.set("color", color);
    formData.set("features", JSON.stringify(features));

    if (isEdit) {
      await updateCommission(commission.id, formData);
      router.push(`/bureau/commissions/${commission.id}`);
    } else {
      await createCommission(formData);
      router.push("/bureau/commissions");
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
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">
              Nom de la commission
            </label>
            <Input name="name" required placeholder="Ex : Commission Sport" defaultValue={commission?.name} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">
              Description
            </label>
            <Textarea name="description" placeholder="Objectif de la commission..." defaultValue={commission?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Budget annuel
              </label>
              <Input name="budget" type="number" step="0.01" placeholder="0.00" defaultValue={commission?.budget ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Modèle
              </label>
              <Select value={model} onChange={(e) => handleModelChange(e.target.value)}>
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Apparence
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Icône</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[10px] border text-lg transition-colors",
                    icon === i
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-border hover:bg-surface-secondary"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    color === c
                      ? "scale-110 border-content-primary"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Modules activés
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFeature(f.id)}
              className={cn(
                "flex items-center gap-2 rounded-[10px] border p-3 text-[13px] font-medium transition-colors",
                features.includes(f.id)
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-border text-content-muted hover:bg-surface-secondary"
              )}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
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
            : isEdit ? "Enregistrer" : "Créer la commission"
          }
        </button>
      </div>
    </form>
  );
}
