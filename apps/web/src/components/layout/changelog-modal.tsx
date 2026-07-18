"use client";

import { useEffect, useState, useTransition } from "react";
import { getUnseenChangelogs, markChangelogsSeen } from "@/lib/actions/changelogs";

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string | null;
  changes: string[];
  published_at: string;
}

export function ChangelogModal() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getUnseenChangelogs()
      .then((data) => {
        if (data && data.length > 0) {
          setEntries(data as ChangelogEntry[]);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  function handleClose() {
    setOpen(false);
    startTransition(() => {
      markChangelogsSeen().catch(() => {});
    });
  }

  if (!open || entries.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9500] flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50 animate-in fade-in" onClick={handleClose} />
      <div className="relative z-10 mx-4 mb-4 sm:mb-0 w-full max-w-md max-h-[80vh] flex flex-col rounded-[20px] bg-surface-elevated shadow-lg animate-in slide-in-from-bottom-4 fade-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Nouveautés</h2>
              <p className="text-xs text-content-secondary">
                {entries.length} mise{entries.length > 1 ? "s" : ""} à jour
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-content-secondary hover:text-content-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-4 border-l-2 border-brand-300 dark:border-brand-500/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-brand-100 dark:bg-brand-500/20 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                  v{entry.version}
                </span>
                <span className="text-[11px] text-content-muted">
                  {new Date(entry.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-content-primary mb-1">
                {entry.title}
              </h3>
              {entry.description && (
                <p className="text-[13px] text-content-secondary mb-2">
                  {entry.description}
                </p>
              )}
              {entry.changes && entry.changes.length > 0 && (
                <ul className="space-y-1">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-content-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {change}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-3">
          <button
            onClick={handleClose}
            className="w-full rounded-[14px] bg-brand-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
          >
            C&apos;est noté !
          </button>
        </div>
      </div>
    </div>
  );
}
