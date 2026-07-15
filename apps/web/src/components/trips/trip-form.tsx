"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createTrip } from "@/lib/actions/trips";

export function TripForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await createTrip(new FormData(e.currentTarget));
    router.push("/bureau/voyages");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Destination</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Destination</label>
            <Input name="destination" required placeholder="Saint-Malo, Strasbourg..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Programme du voyage..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Date de départ</label>
              <Input name="start_date" type="date" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Date de retour</label>
              <Input name="end_date" type="date" required />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tarifs et places</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Prix adulte</label>
              <Input name="price_adult" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Prix enfant</label>
              <Input name="price_child" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Places max</label>
              <Input name="max_seats" type="number" placeholder="Illimité" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création..." : "Créer le voyage"}
        </Button>
      </div>
    </form>
  );
}
