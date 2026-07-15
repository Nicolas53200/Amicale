"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createEvent } from "@/lib/actions/events";

export function EventForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await createEvent(new FormData(e.currentTarget));
    router.push("/bureau/evenements");
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
            <label className="text-sm font-medium text-content-secondary">Titre</label>
            <Input name="title" required placeholder="Repas de Noël, Tournoi..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Détails de l'événement..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Date de début</label>
              <Input name="date" type="datetime-local" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Date de fin</label>
              <Input name="end_date" type="datetime-local" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Lieu</label>
            <Input name="location" placeholder="Salle des fêtes, caserne..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Prix</label>
              <Input name="price" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Places max</label>
              <Input name="max_attendees" type="number" placeholder="Illimité" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Bénévoles max</label>
              <Input name="max_benevoles" type="number" placeholder="Illimité" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Catégorie</label>
            <Input name="category" placeholder="Repas, Sport, Culturel..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création..." : "Créer l'événement"}
        </Button>
      </div>
    </form>
  );
}
