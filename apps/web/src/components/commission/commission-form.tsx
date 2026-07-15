"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createCommission } from "@/lib/actions/commissions";
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
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "compta", label: "Comptabilité", icon: "💰" },
  { id: "membres", label: "Membres", icon: "👥" },
];

const ICONS = ["📋", "🎉", "🏠", "✈️", "🎁", "⚽", "🎄", "🤝", "☕", "🎵", "📦", "🛡️"];

const COLORS = [
  "#FF6B35", "#3B82F6", "#10B981", "#8B5CF6",
  "#F59E0B", "#EF4444", "#EC4899", "#06B6D4",
];

export function CommissionForm() {
  const router = useRouter();
  const [model, setModel] = useState("simple");
  const [icon, setIcon] = useState("📋");
  const [color, setColor] = useState("#FF6B35");
  const [features, setFeatures] = useState(["notifications", "documents", "compta", "membres"]);
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

    await createCommission(formData);
    router.push("/bureau/commissions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">
              Nom de la commission
            </label>
            <Input name="name" required placeholder="Ex : Commission Sport" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">
              Description
            </label>
            <Textarea name="description" placeholder="Objectif de la commission..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Budget annuel
              </label>
              <Input name="budget" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Modèle
              </label>
              <Select value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Icône</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-colors",
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Couleur</label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules activés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFeature(f.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création..." : "Créer la commission"}
        </Button>
      </div>
    </form>
  );
}
