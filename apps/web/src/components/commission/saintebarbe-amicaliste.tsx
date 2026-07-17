"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function SainteBarbeAmicaliste() {
  const [inscrit, setInscrit] = useState(false);
  const [nbInvites, setNbInvites] = useState(0);

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
            <p className="text-[12px] text-red-800 dark:text-red-400">Sam. 4 déc. 2026 · 19h00 · Salle des fêtes</p>
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
            ["📅", "Date", "4 déc. 2026"],
            ["🕐", "Heure", "19h00"],
            ["📍", "Lieu", "Salle des fêtes"],
            ["👥", "Capacité", "120 places"],
            ["💰", "Tarif adulte", "25 €"],
            ["👶", "Tarif enfant", "12 €"],
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
              <label className="mb-1 block text-[11px] font-medium text-content-muted">Nombre d&apos;invités (max 4)</label>
              <input type="number" min={0} max={4} value={nbInvites} onChange={(e) => setNbInvites(Math.min(4, Number(e.target.value)))}
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
