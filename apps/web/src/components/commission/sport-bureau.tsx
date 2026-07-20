"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCommissionActivities } from "@/hooks/use-commission-data";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface SportEvent {
  id: string;
  nom: string;
  date: string;
  lieu: string;
  statut: "programme" | "termine" | "annule";
  inscrits: number;
  max: number;
}

interface Membre {
  nom: string;
  role: "responsable" | "membre";
  email: string;
}

const DEMO_EVENTS: SportEvent[] = [
  { id: "tournoi", nom: "Tournoi sportif inter-centres", date: "2026-07-12T10:00", lieu: "Stade municipal", statut: "programme", inscrits: 24, max: 40 },
  { id: "foot", nom: "Tournoi de football", date: "2026-09-20T14:00", lieu: "Terrain synthétique", statut: "programme", inscrits: 16, max: 22 },
  { id: "course", nom: "Course solidaire", date: "2026-05-10T09:00", lieu: "Parc de la Ville", statut: "termine", inscrits: 35, max: 50 },
];

const DEMO_MEMBRES: Membre[] = [
  { nom: "Marc Dubois", role: "responsable", email: "marc.d@email.fr" },
  { nom: "Anne Leclerc", role: "membre", email: "anne.l@email.fr" },
  { nom: "Thomas Blanc", role: "membre", email: "thomas.b@email.fr" },
];

type Tab = "tableau" | "evenements" | "compta" | "rapport" | "membres";

const STATUT_BADGE: Record<string, { label: string; cls: string }> = {
  programme: { label: "Programmé", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30" },
  termine: { label: "Terminé", cls: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  annule: { label: "Annulé", cls: "bg-red-100 text-red-600 dark:bg-red-900/30" },
};

export function SportBureau({ commissionId, budget = 300 }: { commissionId: string; budget?: number }) {
  const [tab, setTab] = useState<Tab>("tableau");
  const { activities: dbEvents, loading: eventsLoading, add: addEvent, update: updateEvent, remove: removeEvent } = useCommissionActivities(commissionId, "sport_event");

  const events: SportEvent[] = dbEvents.length > 0
    ? dbEvents.map((a) => ({
        id: a.id as string,
        nom: a.title as string,
        date: a.date as string,
        lieu: (a.metadata as Record<string, unknown>)?.location as string ?? "",
        statut: a.status as "programme" | "termine" | "annule",
        inscrits: (a.metadata as Record<string, unknown>)?.current_participants as number ?? 0,
        max: (a.metadata as Record<string, unknown>)?.max_participants as number ?? 0,
      }))
    : DEMO_EVENTS;

  const membres = DEMO_MEMBRES;

  const [rapportTitre, setRapportTitre] = useState("");
  const [rapportActivites, setRapportActivites] = useState("");
  const [rapportPoints, setRapportPoints] = useState("");
  const [docType, setDocType] = useState<"devis" | "facture" | "recette">("devis");

  const depense = 0;
  const aVenir = events.filter((e) => e.statut === "programme").length;

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "📊", label: "Tableau" },
    { key: "evenements", icon: "🏆", label: "Événements" },
    { key: "compta", icon: "💰", label: "Compta" },
    { key: "rapport", icon: "📈", label: "Rapport" },
    { key: "membres", icon: "👥", label: "Membres" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key ? "bg-green-600 text-white shadow-sm" : "bg-surface-elevated text-content-secondary")}>
              <span className="text-[14px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "tableau" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[11px] text-content-muted">Événements</p>
              <p className="text-[18px] font-bold text-content-primary">{aVenir}</p>
              <p className="text-[10px] text-content-muted">planifié{aVenir > 1 ? "s" : ""} 2026</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[11px] text-content-muted">Budget</p>
              <p className="text-[18px] font-bold text-green-600">{fmt(budget)}</p>
              <p className="text-[10px] text-content-muted">alloué · {fmt(depense)} dépensé</p>
            </div>
          </div>

          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Actions rapides</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🏆", label: "Gérer les événements", bg: "bg-green-100 dark:bg-green-500/20", action: () => setTab("evenements") },
              { icon: "📤", label: "Envoyer à la compta", bg: "bg-amber-100 dark:bg-amber-500/20", action: () => setTab("compta") },
              { icon: "📈", label: "Faire un rapport", bg: "bg-blue-100 dark:bg-blue-500/20", action: () => setTab("rapport") },
              { icon: "💬", label: "Messagerie", bg: "bg-rose-100 dark:bg-rose-500/20", action: undefined },
            ].map((a, i) => (
              <button key={i} type="button" onClick={a.action}
                className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3 text-left shadow-sm transition-colors active:bg-surface-secondary">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-[12px]", a.bg)}>
                  <span className="text-[18px]">{a.icon}</span>
                </div>
                <span className="text-[12px] font-semibold text-content-primary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "evenements" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Événements sportifs</p>
          {events.map((ev) => {
            const d = new Date(ev.date);
            const badge = STATUT_BADGE[ev.statut];
            return (
              <div key={ev.id} className="overflow-hidden rounded-[16px] bg-surface-elevated shadow-sm">
                <div className="relative flex items-end bg-gradient-to-br from-purple-600 to-purple-700 p-3" style={{ minHeight: 80 }}>
                  <div className="pointer-events-none absolute right-3 top-2 text-[34px] opacity-[0.18]">🏆</div>
                  <div className="relative z-10 flex-1">
                    <p className="text-[13px] font-bold text-white">{ev.nom}</p>
                    <p className="text-[11px] text-white/80">
                      {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      {" · "}{ev.lieu}
                    </p>
                  </div>
                  {badge && (
                    <span className={cn("relative z-10 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold", badge.cls)}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 p-3">
                  <span className="flex-1 rounded-[10px] bg-surface-secondary p-2 text-center text-[11px] text-content-muted">
                    {ev.inscrits}/{ev.max} inscrits
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "compta" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Envoyer au comptable</p>
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="mb-3 flex gap-2">
              {(["devis", "facture", "recette"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setDocType(t)}
                  className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    docType === t ? "bg-green-600 text-white" : "bg-surface-secondary text-content-secondary")}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Libellé</label>
                <input type="text" placeholder="ex: Location terrain" className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Montant</label>
                <input type="number" placeholder="0" className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted" />
              </div>
            </div>
            <div className="mt-3 rounded-[12px] border-2 border-dashed border-border p-4 text-center">
              <span className="mb-1 block text-xl">📎</span>
              <p className="text-[12px] font-semibold text-content-primary">Joindre la facture / scan</p>
              <p className="text-[10px] text-content-muted">PDF, JPG · max 10 Mo</p>
            </div>
            <button type="button" className="mt-3 w-full rounded-[12px] bg-green-600 px-4 py-2.5 text-[12px] font-semibold text-white">
              Envoyer au comptable
            </button>
          </div>
        </div>
      )}

      {tab === "rapport" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Rapport de commission</p>
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Titre du rapport</label>
                <input type="text" value={rapportTitre} onChange={(e) => setRapportTitre(e.target.value)}
                  placeholder="ex: Bilan commission sportive 2026"
                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Activités réalisées</label>
                <textarea value={rapportActivites} onChange={(e) => setRapportActivites(e.target.value)}
                  rows={3} placeholder="Événements organisés, résultats..."
                  className="w-full resize-none rounded-[10px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-secondary">Points à aborder en réunion</label>
                <textarea value={rapportPoints} onChange={(e) => setRapportPoints(e.target.value)}
                  rows={2} placeholder="Difficultés, propositions..."
                  className="w-full resize-none rounded-[10px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted" />
              </div>
            </div>
          </div>
          <button type="button" className="w-full rounded-[12px] bg-green-600 px-4 py-2.5 text-[12px] font-semibold text-white">
            Envoyer au bureau
          </button>
          <button type="button" className="w-full rounded-[12px] bg-blue-600 px-4 py-2.5 text-[12px] font-semibold text-white">
            Exporter PDF
          </button>
        </div>
      )}

      {tab === "membres" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">
            {membres.length} membres de la commission
          </p>
          {membres.map((m, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-[13px] font-bold text-green-700 dark:bg-green-900/30">
                {m.nom.split(" ").map((w) => w[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-content-primary">{m.nom}</p>
                <p className="text-[11px] text-content-muted">
                  {m.role === "responsable" ? "Responsable" : "Membre"} · {m.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
