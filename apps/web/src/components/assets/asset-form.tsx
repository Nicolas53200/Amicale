"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createAsset } from "@/lib/actions/assets";

export function AssetForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await createAsset(new FormData(e.currentTarget));
    router.push("/bureau/locations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Nom</label>
              <Input name="name" required placeholder="Appartement Lacanau, Barnum..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Type</label>
              <Select name="type" required>
                <option value="appartement">Appartement</option>
                <option value="barnum">Barnum</option>
                <option value="remorque">Remorque</option>
                <option value="camping">Camping-car</option>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Description du bien..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Tarif journalier</label>
              <Input name="daily_rate" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Caution</label>
              <Input name="deposit" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Règlement intérieur</label>
            <Textarea name="rules" placeholder="Conditions d'utilisation..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création..." : "Ajouter le bien"}
        </Button>
      </div>
    </form>
  );
}
