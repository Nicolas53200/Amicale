"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEvent, updateEvent } from "@/lib/actions/events";
import { cn } from "@/lib/utils";

interface EventData {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  end_date?: string | null;
  location?: string | null;
  price?: number;
  max_attendees?: number | null;
  max_benevoles?: number | null;
  category?: string | null;
  commission_id?: string | null;
}

const eventTypes = [
  { value: "repas", label: "Repas", icon: "🍴", color: "bg-orange-100 dark:bg-orange-500/20 border-orange-300 dark:border-orange-500/40" },
  { value: "bal", label: "Bal", icon: "🎵", color: "bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/40" },
  { value: "sport", label: "Sport", icon: "🏆", color: "bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/40" },
  { value: "ceremonie", label: "Ceremonie", icon: "🎖️", color: "bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40" },
  { value: "sortie", label: "Sortie", icon: "⛰️", color: "bg-teal-100 dark:bg-teal-500/20 border-teal-300 dark:border-teal-500/40" },
  { value: "autre", label: "Autre", icon: "🎉", color: "bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40" },
];

export function EventForm({ event }: { event?: EventData }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(event?.category || "");
  const isEdit = !!event;

  function formatDateForInput(dateStr: string | null | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    if (isEdit) {
      await updateEvent(event.id, fd);
      router.push(`/bureau/evenements/${event.id}`);
    } else {
      await createEvent(fd);
      router.push("/bureau/evenements");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type d'evenement */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Type d&apos;evenement
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {eventTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[12px] border-2 p-3 transition-all",
                selectedType === t.value
                  ? t.color
                  : "border-transparent bg-surface-secondary"
              )}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[11px] font-semibold text-content-primary">
                {t.label}
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={selectedType} />
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Informations
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Titre</label>
            <Input name="title" required placeholder="Repas de Noël, Tournoi..." defaultValue={event?.title} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Détails de l'événement..." defaultValue={event?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de début</label>
              <Input name="date" type="datetime-local" required defaultValue={formatDateForInput(event?.date)} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de fin</label>
              <Input name="end_date" type="datetime-local" defaultValue={formatDateForInput(event?.end_date)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Lieu</label>
            <Input name="location" placeholder="Salle des fêtes, caserne..." defaultValue={event?.location ?? ""} />
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Paramètres
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prix</label>
              <Input name="price" type="number" step="0.01" placeholder="0" defaultValue={event?.price ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Places max</label>
              <Input name="max_attendees" type="number" placeholder="Illimite" defaultValue={event?.max_attendees ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Benevoles max</label>
              <Input name="max_benevoles" type="number" placeholder="Illimite" defaultValue={event?.max_benevoles ?? ""} />
            </div>
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
            : isEdit ? "Enregistrer" : "Créer l'événement"
          }
        </button>
      </div>
    </form>
  );
}
