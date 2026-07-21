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

  async function handleAction(status: string) {
    setActing(true);
    await updateBookingStatus(bookingId, status);
    router.refresh();
  }

  return (
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
        onClick={() => handleAction("refusee")}
        disabled={acting}
        className="rounded-full bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
      >
        Refuser
      </button>
    </div>
  );
}
