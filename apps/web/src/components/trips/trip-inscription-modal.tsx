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
import { NumberStepper } from "@/components/ui/number-stepper";
import { registerForTrip } from "@/lib/actions/trips";
import { useToast } from "@/components/ui/toast";

interface TripInscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  destination: string;
  priceAdult: number;
  priceChild: number | null;
  maxSeats: number | null;
  currentSeats: number;
  childrenAllowed?: boolean;
  onSuccess: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function TripInscriptionModal({
  open,
  onOpenChange,
  tripId,
  destination,
  priceAdult,
  priceChild,
  maxSeats,
  currentSeats,
  childrenAllowed = true,
  onSuccess,
}: TripInscriptionModalProps) {
  const [nbAdults, setNbAdults] = useState(1);
  const [nbChildren, setNbChildren] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const placesRestantes = maxSeats ? maxSeats - currentSeats : null;
  const maxTotal = placesRestantes !== null ? Math.max(1, placesRestantes) : 20;
  const total = nbAdults * priceAdult + nbChildren * (priceChild ?? 0);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await registerForTrip(tripId, nbAdults, nbChildren, total);
      showToast("Inscription confirmee !", "success");
      onOpenChange(false);
      onSuccess();
      setNbAdults(1);
      setNbChildren(0);
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
              S&apos;inscrire au voyage
            </DialogTitle>
            <DialogDescription className="text-[13px] text-white/70">
              {destination}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          {maxSeats && (
            <div className="flex items-center gap-2 rounded-[12px] bg-surface-secondary p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-content-secondary">Places disponibles</p>
                <p className="text-[14px] font-bold text-content-primary">
                  {currentSeats} / {maxSeats}
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
            label="Adultes"
            value={nbAdults}
            onChange={(v) => {
              setNbAdults(v);
            }}
            min={1}
            max={Math.max(1, maxTotal - nbChildren)}
          />

          {childrenAllowed && priceChild !== null && (
            <NumberStepper
              label="Enfants"
              value={nbChildren}
              onChange={(v) => {
                setNbChildren(v);
              }}
              min={0}
              max={Math.max(0, maxTotal - nbAdults)}
            />
          )}

          <div className="rounded-[14px] bg-surface-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-content-primary">Total</span>
              <span className="text-[15px] font-bold text-brand-600">{fmt(total)}</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-0.5">
              <p className="text-[11px] text-content-muted">
                {nbAdults} adulte{nbAdults > 1 ? "s" : ""} x {fmt(priceAdult)}
              </p>
              {priceChild !== null && nbChildren > 0 && (
                <p className="text-[11px] text-content-muted">
                  {nbChildren} enfant{nbChildren > 1 ? "s" : ""} x {fmt(priceChild)}
                </p>
              )}
            </div>
          </div>
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
