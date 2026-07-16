"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { updateOrganization } from "@/lib/actions/organization";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: {
    modules?: {
      locations?: boolean;
      voyages?: boolean;
      evenements?: boolean;
      bons_cadeaux?: boolean;
    };
    theme_color?: string;
  };
}

const planLabels: Record<string, string> = {
  free: "Gratuit",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function OrgSettingsForm({ org }: { org: OrgData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const modules = org.settings?.modules ?? {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await updateOrganization(new FormData(e.currentTarget));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Informations de l&apos;amicale
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Nom de l&apos;amicale
              </label>
              <Input name="name" defaultValue={org.name} required />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Slug</label>
              <Input value={org.slug} disabled />
            </div>
          </div>
          <p className="text-[12px] text-content-muted">
            Plan : <strong className="text-content-primary">{planLabels[org.plan] || org.plan}</strong>
          </p>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Modules activés
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { key: "evenements", label: "Événements", icon: "🎉" },
            { key: "voyages", label: "Voyages", icon: "✈️" },
            { key: "locations", label: "Locations", icon: "🏠" },
            { key: "bons_cadeaux", label: "Bons cadeaux", icon: "🎁" },
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-[10px] border border-border px-3 py-2.5 transition-colors hover:bg-surface-secondary"
            >
              <input
                type="checkbox"
                name={`mod_${key}`}
                defaultChecked={modules[key as keyof typeof modules] ?? false}
                className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400"
              />
              <span className="text-lg">{icon}</span>
              <span className="text-[13px] font-medium text-content-primary">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Apparence
        </h3>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-content-secondary">
            Couleur de thème
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="theme_color"
              defaultValue={org.settings?.theme_color || "#FF6B35"}
              className="h-10 w-14 cursor-pointer rounded-[8px] border border-border"
            />
            <span className="text-[12px] text-content-muted">
              Couleur principale de l&apos;interface
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {saved && (
          <span className="text-[12px] font-medium text-emerald-600">
            Paramètres mis à jour
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-gradient ml-auto rounded-[14px] px-6 py-3 text-[13px] font-semibold text-white"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
