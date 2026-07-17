"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Reunion {
  id: string;
  title: string;
  message: string | null;
  sent_at: string;
}

const defaultOrdreJour = [
  "Approbation du PV precedent",
  "Bilan financier",
  "Evenements a venir",
  "Questions diverses",
];

export default function ReunionsPage() {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [creating, setCreating] = useState(false);
  const [ordreItems, setOrdreItems] = useState<string[]>([...defaultOrdreJour]);
  const [newOrdreItem, setNewOrdreItem] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    loadReunions();
  }, []);

  async function loadReunions() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, sent_at")
      .eq("type", "reunion")
      .order("sent_at", { ascending: false })
      .limit(20);
    setReunions(data ?? []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;
    const lieu = fd.get("lieu") as string;

    const message = [
      lieu ? `Lieu : ${lieu}` : null,
      `Heure : ${time || "Non defini"}`,
      "",
      "Ordre du jour :",
      ...ordreItems.map((item, i) => `${i + 1}. ${item}`),
    ]
      .filter((l) => l !== null)
      .join("\n");

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const orgId = userData.user?.user_metadata?.org_id;

    const sentAt = date && time ? `${date}T${time}:00` : date ? `${date}T18:00:00` : new Date().toISOString();

    const { error } = await supabase.from("notifications").insert({
      type: "reunion",
      title: title || "Reunion du bureau",
      message,
      sent_at: sentAt,
      org_id: orgId,
    });

    setCreating(false);
    if (error) {
      showToast("Erreur lors de la creation", "error");
    } else {
      showToast("Reunion creee", "success");
      setShowForm(false);
      setOrdreItems([...defaultOrdreJour]);
      setNewOrdreItem("");
      await loadReunions();
    }
  }

  function addOrdreItem() {
    if (newOrdreItem.trim()) {
      setOrdreItems([...ordreItems, newOrdreItem.trim()]);
      setNewOrdreItem("");
    }
  }

  function removeOrdreItem(idx: number) {
    setOrdreItems(ordreItems.filter((_, i) => i !== idx));
  }

  const upcoming = reunions.filter((r) => new Date(r.sent_at) > new Date());
  const past = reunions.filter((r) => new Date(r.sent_at) <= new Date());
  const prochaine = upcoming[0];

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <GradientHeader
          title="Reunions"
          subtitle="Comptes-rendus du bureau"
          backHref="/bureau/dashboard"
        />
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[16px] bg-surface-secondary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Reunions"
        subtitle="Comptes-rendus du bureau"
        backHref="/bureau/dashboard"
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[18px] font-bold text-brand-600 dark:text-brand-400">{reunions.length}</p>
          <p className="text-[11px] text-content-muted">Total</p>
        </div>
        <div className="rounded-[16px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">{upcoming.length}</p>
          <p className="text-[11px] text-content-muted">A venir</p>
        </div>
        <div className="rounded-[16px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[18px] font-bold text-content-secondary">{past.length}</p>
          <p className="text-[11px] text-content-muted">Passees</p>
        </div>
      </div>

      {/* Prochaine reunion */}
      {prochaine && (() => {
        const d = new Date(prochaine.sent_at);
        return (
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
                <span className="text-sm">📌</span>
              </div>
              <h3 className="text-[14px] font-bold text-content-primary">
                Prochaine reunion
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedReunion(prochaine)}
              className="w-full rounded-[12px] bg-surface-secondary p-3 text-left transition-colors hover:bg-surface-tertiary"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[10px] bg-brand-100 dark:bg-brand-500/20">
                  <span className="text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400">
                    {d.toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                  <span className="text-[16px] font-bold leading-none text-brand-700 dark:text-brand-300">
                    {d.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-content-primary">
                    {prochaine.title}
                  </p>
                  <p className="text-[12px] text-content-muted">
                    {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-content-muted">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>
        );
      })()}

      {/* Nouvelle reunion button */}
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white transition-all",
          showForm ? "bg-gray-400 dark:bg-gray-600" : "btn-gradient"
        )}
      >
        {showForm ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Annuler
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle reunion
          </>
        )}
      </button>

      {/* Creation form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-4 text-[14px] font-bold text-content-primary">
            Planifier une reunion
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Titre</label>
              <Input name="title" placeholder="Reunion du bureau" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date</label>
                <Input name="date" type="date" required />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Heure</label>
                <Input name="time" type="time" defaultValue="18:00" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Lieu</label>
              <Input name="lieu" placeholder="Salle du CIS, visio..." />
            </div>

            {/* Ordre du jour */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-content-secondary">
                Ordre du jour
              </label>
              <div className="flex flex-col gap-1.5">
                {ordreItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] text-content-primary">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeOrdreItem(idx)}
                      className="shrink-0 rounded-full p-1 text-content-muted hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={newOrdreItem}
                  onChange={(e) => setNewOrdreItem(e.target.value)}
                  placeholder="Ajouter un point..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOrdreItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addOrdreItem}
                  className="shrink-0 rounded-[10px] bg-brand-100 px-3 text-[12px] font-medium text-brand-600 hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/30"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn-gradient mt-1 rounded-[14px] py-3 text-[13px] font-semibold text-white"
            >
              {creating ? "Creation..." : "Creer la reunion"}
            </button>
          </div>
        </form>
      )}

      {/* Reunions a venir */}
      {upcoming.length > 1 && (
        <div>
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
            A venir
          </h3>
          <div className="flex flex-col gap-2">
            {upcoming.slice(1).map((reunion) => {
              const rd = new Date(reunion.sent_at);
              return (
                <button
                  type="button"
                  key={reunion.id}
                  onClick={() => setSelectedReunion(reunion)}
                  className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 text-left shadow-sm transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-brand-50 dark:bg-brand-500/10">
                    <span className="text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400">
                      {rd.toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-[14px] font-bold leading-none text-brand-700 dark:text-brand-300">
                      {rd.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {reunion.title}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {rd.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reunions passees */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Reunions passees
        </h3>

        {past.length === 0 && reunions.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Aucune réunion"
            description="Les comptes-rendus des réunions apparaîtront ici"
          />
        ) : past.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-content-muted">
            Aucune réunion passée
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {past.map((reunion) => {
              const rd = new Date(reunion.sent_at);
              return (
                <button
                  type="button"
                  key={reunion.id}
                  onClick={() => setSelectedReunion(reunion)}
                  className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 text-left shadow-sm transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-surface-secondary">
                    <span className="text-[9px] font-bold uppercase text-content-muted">
                      {rd.toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-[14px] font-bold leading-none text-content-primary">
                      {rd.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {reunion.title}
                    </p>
                    {reunion.message && (
                      <p className="mt-0.5 truncate text-[11px] text-content-muted">
                        {reunion.message}
                      </p>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedReunion && (
        <div
          className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setSelectedReunion(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[20px] bg-surface-elevated p-5 shadow-xl sm:rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[12px] bg-brand-100 dark:bg-brand-500/20">
                  <span className="text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400">
                    {new Date(selectedReunion.sent_at).toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                  <span className="text-[18px] font-bold leading-none text-brand-700 dark:text-brand-300">
                    {new Date(selectedReunion.sent_at).getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-content-primary">
                    {selectedReunion.title}
                  </h3>
                  <p className="text-[12px] text-content-muted">
                    {new Date(selectedReunion.sent_at).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    a{" "}
                    {new Date(selectedReunion.sent_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReunion(null)}
                className="rounded-full p-1.5 hover:bg-surface-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {selectedReunion.message && (
              <div className="rounded-[12px] bg-surface-secondary p-4">
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-content-secondary">
                  {selectedReunion.message}
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `${selectedReunion.title}\n${new Date(selectedReunion.sent_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n\n${selectedReunion.message || ""}`;
                  try {
                    navigator.clipboard.writeText(text);
                    showToast("Copie dans le presse-papier", "success");
                  } catch {
                    showToast("Impossible de copier", "error");
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-surface-secondary py-2.5 text-[13px] font-medium text-content-secondary transition-colors hover:bg-surface-tertiary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copier
              </button>
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient();
                  const { error } = await supabase.from("notifications").delete().eq("id", selectedReunion.id);
                  if (error) {
                    showToast("Erreur lors de la suppression", "error");
                  } else {
                    showToast("Reunion supprimee", "success");
                    setSelectedReunion(null);
                    await loadReunions();
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-red-50 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
