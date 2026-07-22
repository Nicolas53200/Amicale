"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { updateOrganization } from "@/lib/actions/organization";
import { useToast } from "@/components/ui/toast";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logo_url?: string | null;
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
  const [logoUrl, setLogoUrl] = useState(org.logo_url || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const modules = org.settings?.modules ?? {};
  const { showToast } = useToast();

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const ext = file.name.split(".").pop() || "png";
    const path = `${orgId}/logo.${ext}`;
    await supabase.storage.from("photos").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    await supabase.from("organizations").update({ logo_url: data.publicUrl }).eq("id", orgId);
    setLogoUrl(data.publicUrl);
    setUploadingLogo(false);
    showToast("Logo mis a jour", "success");
  }

  async function handleLogoDelete() {
    const supabase = createClient();
    const orgId = await getOrgIdClient();
    await supabase.from("organizations").update({ logo_url: null }).eq("id", orgId);
    setLogoUrl(null);
    showToast("Logo supprime", "success");
  }

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
          Logo de l&apos;amicale
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-surface-secondary">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 8v4l3 3" />
              </svg>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="cursor-pointer rounded-[10px] bg-brand-500 px-4 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-brand-600">
              {uploadingLogo ? "Envoi..." : "Changer le logo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploadingLogo}
              />
            </label>
            {logoUrl && (
              <button
                type="button"
                onClick={handleLogoDelete}
                className="rounded-[10px] border border-red-200 px-4 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

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

      {/* Cotisations */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Cotisations
        </h3>
        <p className="mb-3 text-[12px] text-content-muted">
          Definissez le montant et la frequence des cotisations des membres.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">
              Montant annuel
            </label>
            <div className="relative">
              <Input
                name="cotisation_amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue=""
                placeholder="30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-content-muted">
                &euro;
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">
              Frequence
            </label>
            <select
              name="cotisation_frequency"
              className="w-full rounded-[10px] border border-border-default bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="annuelle">Annuelle</option>
              <option value="semestrielle">Semestrielle</option>
              <option value="trimestrielle">Trimestrielle</option>
              <option value="mensuelle">Mensuelle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donnees et securite */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Donnees et securite
        </h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 text-left transition-colors hover:bg-surface-tertiary"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 dark:bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-content-primary">Exporter les donnees</p>
              <p className="text-[11px] text-content-muted">Telecharger les donnees de l&apos;amicale (CSV)</p>
            </div>
          </button>
          <button
            type="button"
            className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 text-left transition-colors hover:bg-surface-tertiary"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-content-primary">Politique de confidentialite</p>
              <p className="text-[11px] text-content-muted">RGPD et traitement des donnees</p>
            </div>
          </button>
        </div>
      </div>

      {/* Zone danger */}
      <div className="rounded-[16px] border-2 border-red-200 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-500/5">
        <h3 className="mb-1 text-[14px] font-bold text-red-700 dark:text-red-400">
          Zone danger
        </h3>
        <p className="mb-3 text-[12px] text-red-600/70 dark:text-red-400/70">
          Ces actions sont irreversibles. Procedez avec precaution.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-[10px] border border-red-300 bg-white px-4 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            Reinitialiser les donnees
          </button>
          <button
            type="button"
            className="rounded-[10px] bg-red-600 px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-red-700"
          >
            Supprimer l&apos;amicale
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {saved && (
          <span className="text-[12px] font-medium text-emerald-600">
            Parametres mis a jour
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
