"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";

interface Document {
  id: string;
  title: string;
  content?: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

export function ModuleDocuments({
  commissionId,
  isReadOnly = false,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("commission_id", commissionId)
      .order("created_at", { ascending: false });
    if (data) setDocs(data);
  }, [commissionId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const orgId = await getOrgIdClient();
    const now = new Date();
    const autoTitle =
      title.trim() ||
      `Note du ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    await supabase.from("documents").insert({
      org_id: orgId,
      commission_id: commissionId,
      title: autoTitle,
      content: content.trim() || null,
      created_by: null,
    });

    setTitle("");
    setContent("");
    setSubmitting(false);
    loadDocs();
  }

  async function handleDelete(docId: string) {
    setDeletingId(docId);
    const supabase = createClient();
    await supabase.from("documents").delete().eq("id", docId);
    setDeletingId(null);
    loadDocs();
  }

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.toLocaleDateString("fr-FR")} à ${dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {!isReadOnly && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-2 rounded-[14px] border border-border bg-surface-secondary p-3"
        >
          <Input
            placeholder="Titre (optionnel)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Contenu de la note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-[14px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1"
          />
          <button
            type="submit"
            disabled={submitting || (!title.trim() && !content.trim())}
            className="btn-gradient self-end rounded-full px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "..." : "Ajouter"}
          </button>
        </form>
      )}

      {docs.length === 0 ? (
        <EmptyState
          icon="📄"
          title="Aucun document"
          description="Les documents de la commission apparaîtront ici"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-border bg-surface-elevated px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-content-primary">
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-content-muted">
                    {fmtDate(doc.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-brand-500 hover:underline"
                    >
                      Télécharger
                    </a>
                  )}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    >
                      {deletingId === doc.id ? "..." : "Supprimer"}
                    </button>
                  )}
                </div>
              </div>
              {doc.content && (
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-content-secondary">
                  {doc.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
