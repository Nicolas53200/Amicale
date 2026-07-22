"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/lib/actions/assets";

interface BookingActionsProps {
  bookingId: string;
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const router = useRouter();
  const [acting, setActing] = useState(false);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState("");

  async function handleAction(status: string, reason?: string) {
    setActing(true);
    await updateBookingStatus(bookingId, status, reason);
    setShowRefusalModal(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => handleAction("validee")}
          disabled={acting}
          className="rounded-full bg-green-50 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400"
        >
          Valider
        </button>
        <button
          type="button"
          onClick={() => setShowRefusalModal(true)}
          disabled={acting}
          className="rounded-full bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
        >
          Refuser
        </button>
      </div>

      {showRefusalModal && (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowRefusalModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[16px] bg-surface-elevated p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-bold text-content-primary">Refuser la demande</h3>
            <p className="mt-1 text-[12px] text-content-muted">
              Indiquez un motif de refus (optionnel)
            </p>
            <textarea
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder="Dates indisponibles, bien en maintenance..."
              rows={3}
              className="mt-3 w-full rounded-[12px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRefusalModal(false)}
                className="rounded-[10px] px-4 py-2 text-[12px] font-semibold text-content-secondary hover:bg-surface-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleAction("refusee", refusalReason || undefined)}
                disabled={acting}
                className="rounded-[10px] bg-red-500 px-4 py-2 text-[12px] font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {acting ? "..." : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
