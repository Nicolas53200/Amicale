"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;amicale</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Nom de l&apos;amicale
              </label>
              <Input name="name" defaultValue={org.name} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Slug</label>
              <Input value={org.slug} disabled />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-content-muted">
              Plan : <strong className="text-content-primary">{planLabels[org.plan] || org.plan}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules activés</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            { key: "evenements", label: "Événements", icon: "🎉" },
            { key: "voyages", label: "Voyages", icon: "✈️" },
            { key: "locations", label: "Locations", icon: "🏠" },
            { key: "bons_cadeaux", label: "Bons cadeaux", icon: "🎁" },
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface-secondary"
            >
              <input
                type="checkbox"
                name={`mod_${key}`}
                defaultChecked={modules[key as keyof typeof modules] ?? false}
                className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400"
              />
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium text-content-primary">
                {label}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">
              Couleur de thème
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="theme_color"
                defaultValue={org.settings?.theme_color || "#FF6B35"}
                className="h-10 w-14 cursor-pointer rounded border border-border"
              />
              <span className="text-sm text-content-muted">
                Couleur principale de l&apos;interface
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm font-medium text-emerald-600">
            Paramètres mis à jour
          </span>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
