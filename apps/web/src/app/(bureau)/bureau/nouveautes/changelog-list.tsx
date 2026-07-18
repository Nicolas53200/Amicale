"use client";

import { useState, useTransition } from "react";
import { createChangelog, deleteChangelog } from "@/lib/actions/changelogs";
import { useToast } from "@/components/ui/toast";

interface Changelog {
  id: string;
  version: string;
  title: string;
  description: string | null;
  changes: string[];
  published_at: string;
}

export function ChangelogList({ changelogs }: { changelogs: Changelog[] }) {
  const [showForm, setShowForm] = useState(false);
  const [changes, setChanges] = useState<string[]>([""]);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleAddChange() {
    setChanges([...changes, ""]);
  }

  function handleChangeUpdate(index: number, value: string) {
    const updated = [...changes];
    updated[index] = value;
    setChanges(updated);
  }

  function handleRemoveChange(index: number) {
    setChanges(changes.filter((_, i) => i !== index));
  }

  function handleSubmit(formData: FormData) {
    const filtered = changes.filter((c) => c.trim() !== "");
    formData.set("changes", JSON.stringify(filtered));
    startTransition(async () => {
      try {
        await createChangelog(formData);
        showToast("Nouveauté publiée", "success");
        setShowForm(false);
        setChanges([""]);
      } catch {
        showToast("Erreur lors de la publication", "error");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteChangelog(id);
        showToast("Nouveauté supprimée", "success");
      } catch {
        showToast("Erreur lors de la suppression", "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-[14px] bg-brand-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600"
        >
          + Publier une nouveauté
        </button>
      )}

      {showForm && (
        <form action={handleSubmit} className="rounded-[14px] bg-surface-elevated p-5 shadow-sm space-y-4">
          <h3 className="text-[15px] font-semibold text-content-primary">Nouvelle mise à jour</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Version
              </label>
              <input
                name="version"
                required
                placeholder="1.3.0"
                className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[14px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Titre
              </label>
              <input
                name="title"
                required
                placeholder="Nouveau calendrier"
                className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[14px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">
              Description (optionnel)
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Résumé de la mise à jour..."
              className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[14px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-medium text-content-secondary">
              Changements
            </label>
            <div className="space-y-2">
              {changes.map((change, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={change}
                    onChange={(e) => handleChangeUpdate(i, e.target.value)}
                    placeholder="Ajout du mode sombre..."
                    className="flex-1 rounded-[10px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none"
                  />
                  {changes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChange(i)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-content-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddChange}
              className="mt-2 text-[13px] font-medium text-brand-500 hover:text-brand-600"
            >
              + Ajouter un changement
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-[14px] bg-brand-500 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              {pending ? "Publication..." : "Publier"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setChanges([""]); }}
              className="rounded-[14px] bg-surface-secondary px-5 py-2.5 text-[14px] font-medium text-content-secondary transition-colors hover:bg-border-subtle"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {changelogs.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-[14px] bg-surface-elevated py-16 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-content-primary">Aucune nouveauté publiée</p>
          <p className="mt-1 text-[13px] text-content-secondary">
            Publiez une mise à jour pour informer vos membres
          </p>
        </div>
      )}

      <div className="space-y-3">
        {changelogs.map((entry) => (
          <div
            key={entry.id}
            className="rounded-[14px] bg-surface-elevated p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-100 dark:bg-brand-500/20 px-2.5 py-0.5 text-[12px] font-semibold text-brand-600 dark:text-brand-400">
                  v{entry.version}
                </span>
                <span className="text-[12px] text-content-muted">
                  {new Date(entry.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={pending}
                className="flex h-7 w-7 items-center justify-center rounded-full text-content-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
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
              <ul className="space-y-1 mt-2">
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
    </div>
  );
}
