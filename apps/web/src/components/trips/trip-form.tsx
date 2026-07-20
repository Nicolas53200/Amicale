"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTrip, updateTrip } from "@/lib/actions/trips";

interface TripData {
  id: string;
  destination: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  price_adult: number;
  price_child?: number | null;
  max_seats?: number | null;
  commission_id?: string | null;
}

export function TripForm({ trip }: { trip?: TripData }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!trip;

  function formatDateForInput(dateStr: string | null | undefined) {
    if (!dateStr) return "";
    return dateStr.slice(0, 10);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    if (isEdit) {
      await updateTrip(trip.id, fd);
      router.push(`/bureau/voyages/${trip.id}`);
    } else {
      await createTrip(fd);
      router.push("/bureau/voyages");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Destination
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Destination</label>
            <Input name="destination" required placeholder="Saint-Malo, Strasbourg..." defaultValue={trip?.destination} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Programme du voyage..." defaultValue={trip?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de départ</label>
              <Input name="start_date" type="date" required defaultValue={formatDateForInput(trip?.start_date)} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de retour</label>
              <Input name="end_date" type="date" required defaultValue={formatDateForInput(trip?.end_date)} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Tarifs et places
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prix adulte</label>
              <Input name="price_adult" type="number" step="0.01" required placeholder="0.00" defaultValue={trip?.price_adult ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prix enfant</label>
              <Input name="price_child" type="number" step="0.01" placeholder="0.00" defaultValue={trip?.price_child ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Places max</label>
              <Input name="max_seats" type="number" placeholder="Illimité" defaultValue={trip?.max_seats ?? ""} />
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
            : isEdit ? "Enregistrer" : "Créer le voyage"
          }
        </button>
      </div>
    </form>
  );
}
