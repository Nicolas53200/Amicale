"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { NumberStepper } from "@/components/ui/number-stepper";
import { registerForEvent } from "@/lib/actions/events";
import { useToast } from "@/components/ui/toast";

const BENEVOLE_ROLES = [
  { value: "", label: "Non" },
  { value: "cuisine", label: "Cuisine" },
  { value: "service", label: "Service" },
  { value: "installation", label: "Installation" },
  { value: "rangement", label: "Rangement" },
] as const;

interface EventInscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  price: number;
  maxAttendees: number | null;
  currentInscrits: number;
  maxBenevoles: number | null;
  currentBenevoles: number;
  onSuccess: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function EventInscriptionModal({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  price,
  maxAttendees,
  currentInscrits,
  maxBenevoles,
  currentBenevoles,
  onSuccess,
}: EventInscriptionModalProps) {
  const [nbPersonnes, setNbPersonnes] = useState(1);
  const [benevoleRole, setBenevoleRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const placesRestantes = maxAttendees ? maxAttendees - currentInscrits : null;
  const maxPersonnes = placesRestantes !== null ? Math.max(1, placesRestantes) : 10;
  const benevolesRestants = maxBenevoles ? maxBenevoles - currentBenevoles : null;
  const benevolesFull = benevolesRestants !== null && benevolesRestants <= 0;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await registerForEvent(eventId, nbPersonnes, benevoleRole || undefined);
      showToast("Inscription confirmee !", "success");
      onOpenChange(false);
      onSuccess();
      setNbPersonnes(1);
      setBenevoleRole("");
    } catch {
      showToast("Erreur lors de l'inscription", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-md rounded-[20px] p-0">
        <div className="rounded-t-[20px] bg-accent-gradient px-5 pb-4 pt-5">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold text-white">
              S&apos;inscrire
            </DialogTitle>
            <DialogDescription className="text-[13px] text-white/70">
              {eventTitle}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          {maxAttendees && (
            <div className="flex items-center gap-2 rounded-[12px] bg-surface-secondary p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-content-secondary">Places disponibles</p>
                <p className="text-[14px] font-bold text-content-primary">
                  {currentInscrits} / {maxAttendees}
                </p>
              </div>
              {placesRestantes !== null && placesRestantes <= 5 && placesRestantes > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  Plus que {placesRestantes} !
                </span>
              )}
            </div>
          )}

          <NumberStepper
            label="Nombre de personnes"
            value={nbPersonnes}
            onChange={setNbPersonnes}
            min={1}
            max={maxPersonnes}
          />

          {price > 0 && (
            <div className="flex items-center justify-between rounded-[14px] bg-surface-secondary p-3">
              <span className="text-[13px] font-medium text-content-primary">Total</span>
              <span className="text-[15px] font-bold text-brand-600">
                {fmt(price * nbPersonnes)}
              </span>
            </div>
          )}

          {(maxBenevoles === null || maxBenevoles > 0) && (
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-content-secondary">
                Participer comme benevole ?
                {benevolesRestants !== null && (
                  <span className="ml-1 text-content-muted">
                    ({currentBenevoles}/{maxBenevoles} inscrits)
                  </span>
                )}
              </label>
              <Select
                value={benevoleRole}
                onChange={(e) => setBenevoleRole(e.target.value)}
                disabled={benevolesFull && !benevoleRole}
              >
                {BENEVOLE_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
              {benevolesFull && !benevoleRole && (
                <p className="mt-1 text-[11px] text-content-muted">
                  Toutes les places benevoles sont prises
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-3 border-t border-border px-5 pb-5 pt-4">
          <DialogClose asChild>
            <button
              type="button"
              className="flex-1 rounded-[14px] bg-surface-secondary px-4 py-3 text-[13px] font-semibold text-content-primary transition-colors hover:bg-surface-primary"
            >
              Annuler
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Inscription..." : "Confirmer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
