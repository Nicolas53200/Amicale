"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";

interface Document {
  id: string;
  title: string;
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
  const [submitting, setSubmitting] = useState(false);

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
    if (!title.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const orgId = await getOrgIdClient();

    await supabase.from("documents").insert({
      org_id: orgId,
      commission_id: commissionId,
      title: title.trim(),
      created_by: null,
    });

    setTitle("");
    setSubmitting(false);
    loadDocs();
  }

  return (
    <div className="flex flex-col gap-4">
      {!isReadOnly && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Titre du document..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting} size="default">
            Ajouter
          </Button>
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
              className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-content-primary">
                  {doc.title}
                </p>
                <p className="text-xs text-content-muted">
                  {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-500 hover:underline"
                >
                  Télécharger
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
