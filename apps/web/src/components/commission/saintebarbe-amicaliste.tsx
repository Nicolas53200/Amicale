"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCommissionSettings } from "@/hooks/use-commission-data";

const DEMO_SETTINGS: Record<string, string> = {
  event_date: "4 dec. 2026",
  event_time: "19h00",
  event_venue: "Salle des fetes",
  capacity: "120 places",
  tarif_adulte: "25 €",
  tarif_enfant: "12 €",
  max_guests: "4",
};

export function SainteBarbeAmicaliste({ commissionId }: { commissionId: string }) {
  const [inscrit, setInscrit] = useState(false);
  const [nbInvites, setNbInvites] = useState(0);

  // Supabase settings with demo fallback
  const { settings: dbSettings } = useCommissionSettings({ commissionId });

  const hasDbSettings = Object.keys(dbSettings).length > 0;
  const settings = hasDbSettings
    ? {
        event_date: (dbSettings.event_date as string) ?? DEMO_SETTINGS.event_date,
        event_time: (dbSettings.event_time as string) ?? DEMO_SETTINGS.event_time,
        event_venue: (dbSettings.event_venue as string) ?? DEMO_SETTINGS.event_venue,
        capacity: (dbSettings.capacity as string) ?? DEMO_SETTINGS.capacity,
        tarif_adulte: (dbSettings.tarif_adulte as string) ?? DEMO_SETTINGS.tarif_adulte,
        tarif_enfant: (dbSettings.tarif_enfant as string) ?? DEMO_SETTINGS.tarif_enfant,
        max_guests: (dbSettings.max_guests as string) ?? DEMO_SETTINGS.max_guests,
      }
    : DEMO_SETTINGS;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="rounded-[16px] bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-red-600">
            <span className="text-xl text-white">🔥</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-red-600">Sainte-Barbe 2026</p>
            <p className="text-[12px] text-red-800 dark:text-red-400">Sam. {settings.event_date} · {settings.event_time} · {settings.event_venue}</p>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-red-800 dark:text-red-400">
          Repas annuel de l&apos;amicale des sapeurs-pompiers. Soirée festive avec repas, musique et animations.
        </p>
      </div>

      {/* Infos */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Informations</p>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {[
            ["📅", "Date", settings.event_date],
            ["🕐", "Heure", settings.event_time],
            ["📍", "Lieu", settings.event_venue],
            ["👥", "Capacité", settings.capacity],
            ["💰", "Tarif adulte", settings.tarif_adulte],
            ["👶", "Tarif enfant", settings.tarif_enfant],
          ].map(([icon, label, value]) => (
            <div key={label as string} className="flex items-center gap-2 rounded-[10px] bg-surface-secondary px-3 py-2">
              <span>{icon}</span>
              <div>
                <p className="text-[10px] text-content-muted">{label}</p>
                <p className="font-semibold text-content-primary">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inscription */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Mon inscription</p>
        {!inscrit ? (
          <div>
            <div className="mb-3">
              <label className="mb-1 block text-[11px] font-medium text-content-muted">Nombre d&apos;invités (max {settings.max_guests})</label>
              <input type="number" min={0} max={Number(settings.max_guests)} value={nbInvites} onChange={(e) => setNbInvites(Math.min(Number(settings.max_guests), Number(e.target.value)))}
                className="w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-primary" />
            </div>
            <button type="button" onClick={() => setInscrit(true)}
              className="w-full rounded-full bg-red-600 py-2.5 text-[13px] font-semibold text-white shadow-sm">
              S&apos;inscrire ({1 + nbInvites} personne{nbInvites > 0 ? "s" : ""})
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-3 rounded-[12px] bg-green-50 p-3 dark:bg-green-900/20">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-[13px] font-semibold text-green-700">Inscription confirmée</p>
                <p className="text-[11px] text-green-600">{1 + nbInvites} personne{nbInvites > 0 ? "s" : ""} · Menu standard</p>
              </div>
            </div>
            <button type="button" onClick={() => setInscrit(false)}
              className={cn("w-full rounded-full py-2.5 text-[12px] font-semibold",
                "border border-red-200 text-red-600 dark:border-red-800")}>
              Annuler mon inscription
            </button>
          </div>
        )}
      </div>

      {/* Programme */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Programme de la soirée</p>
        {[
          { heure: "19h00", label: "Accueil & apéritif" },
          { heure: "19h30", label: "Discours du président" },
          { heure: "20h00", label: "Repas" },
          { heure: "22h00", label: "Soirée dansante" },
          { heure: "01h00", label: "Fin de soirée" },
        ].map((p, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-surface-secondary py-2.5 last:border-0">
            <span className="w-12 shrink-0 text-[12px] font-bold text-red-600">{p.heure}</span>
            <p className="text-[13px] text-content-primary">{p.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
