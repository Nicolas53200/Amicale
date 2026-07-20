"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/lib/actions/events";

export function EventActions({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteEvent(eventId);
    router.push("/bureau/evenements");
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded-full bg-surface-secondary px-3 py-2 text-[12px] font-semibold text-content-primary"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full bg-red-600 px-3 py-2 text-[12px] font-semibold text-white"
        >
          {deleting ? "..." : "Confirmer"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="rounded-full bg-red-50 px-4 py-2 text-[12px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
    >
      Supprimer
    </button>
  );
}
