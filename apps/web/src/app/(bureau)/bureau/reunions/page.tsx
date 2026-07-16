"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface Reunion {
  id: string;
  title: string;
  message: string | null;
  sent_at: string;
}

export default function ReunionsPage() {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
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
    load();
  }, []);

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
            <div className="rounded-[12px] bg-surface-secondary p-3">
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
                  {prochaine.message && (
                    <p className="mt-2 whitespace-pre-line text-[13px] text-content-secondary">
                      {prochaine.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Nouvelle reunion button */}
      <button
        type="button"
        onClick={() => showToast("Fonction a venir", "info")}
        className="btn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nouvelle reunion
      </button>

      {/* Reunions passees */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Reunions passees
        </h3>

        {past.length === 0 && reunions.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Aucune reunion"
            description="Les comptes-rendus des reunions apparaitront ici"
          />
        ) : past.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-content-muted">
            Aucune reunion passee
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {past.map((reunion) => {
              const rd = new Date(reunion.sent_at);
              return (
                <div
                  key={reunion.id}
                  className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm"
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-content-muted"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
