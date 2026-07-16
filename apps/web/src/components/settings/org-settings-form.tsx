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
    background_tint?: string;
    welcome_message?: string;
    ville?: string;
  };
}

const colorPresets = [
  { value: "#E8553A", label: "Orange" },
  { value: "#1a3a7c", label: "Bleu" },
  { value: "#1a6b3a", label: "Vert" },
  { value: "#534AB7", label: "Violet" },
  { value: "#b45309", label: "Ambre" },
];

const backgroundTints = [
  { value: "#F5EFE6", label: "Beige" },
  { value: "#F0F4FF", label: "Bleu pale" },
  { value: "#F0FDF4", label: "Vert pale" },
  { value: "#FFFFFF", label: "Blanc" },
];

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
  const [themeColor, setThemeColor] = useState(org.settings?.theme_color || "#E8553A");
  const [bgTint, setBgTint] = useState(org.settings?.background_tint || "#FFFFFF");
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
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Ville / departement
              </label>
              <Input name="ville" defaultValue={org.settings?.ville ?? ""} placeholder="Laval (53)" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Slug</label>
              <Input value={org.slug} disabled />
            </div>
            <div>
              <p className="mb-1 text-[12px] font-medium text-content-secondary">Plan</p>
              <p className="rounded-[10px] bg-surface-secondary px-3 py-2.5 text-[13px] font-semibold text-content-primary">
                {planLabels[org.plan] || org.plan}
              </p>
            </div>
          </div>
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
          Couleur principale
        </h3>
        <p className="mb-3 text-[12px] text-content-muted">
          S&apos;applique sur les headers, boutons et accents de l&apos;application.
        </p>
        <div className="mb-3 flex gap-2">
          {colorPresets.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setThemeColor(c.value)}
              className="relative h-11 flex-1 rounded-[12px] transition-all"
              style={{
                backgroundColor: c.value,
                outline: themeColor === c.value ? "3px solid var(--color-brand-500)" : "none",
                outlineOffset: "2px",
              }}
            >
              {themeColor === c.value && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 m-auto">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-[12px] text-content-muted">Couleur libre</span>
          <input
            type="color"
            name="theme_color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-[8px] border border-border"
          />
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Fond de l&apos;application
        </h3>
        <p className="mb-3 text-[12px] text-content-muted">
          Teinte de fond des ecrans.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {backgroundTints.map((bg) => (
            <button
              key={bg.value}
              type="button"
              onClick={() => setBgTint(bg.value)}
              className="overflow-hidden rounded-[12px] transition-all"
              style={{
                border: bgTint === bg.value ? "3px solid var(--color-brand-500)" : "3px solid transparent",
              }}
            >
              <div className="h-10" style={{ backgroundColor: bg.value, border: bg.value === "#FFFFFF" ? "1px solid #eee" : "none" }} />
              <div className="bg-surface-elevated px-1 py-1.5 text-center text-[9px] font-bold text-content-muted">
                {bg.label}
              </div>
            </button>
          ))}
        </div>
        <input type="hidden" name="background_tint" value={bgTint} />
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Message d&apos;accueil
        </h3>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-content-secondary">
            Texte de la banniere
          </label>
          <textarea
            name="welcome_message"
            rows={2}
            defaultValue={org.settings?.welcome_message ?? ""}
            placeholder="ex: Bienvenue dans votre espace amicaliste !"
            className="w-full resize-none rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
          />
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
