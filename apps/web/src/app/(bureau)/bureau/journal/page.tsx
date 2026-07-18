"use client";

import { useState, useEffect, useCallback } from "react";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  message: string;
  sent_at: string;
  type?: string | null;
}

const postTypes = [
  { value: "info", label: "Info", icon: "📢" },
  { value: "evenement", label: "Événement", icon: "📅" },
  { value: "resultat", label: "Résultat", icon: "🏆" },
  { value: "important", label: "Important", icon: "⚠️" },
];

export default function JournalBureauPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [postType, setPostType] = useState("info");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, sent_at")
      .is("commission_id", null)
      .is("target_member_id", null)
      .order("sent_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const orgId = await getOrgIdClient();

    await supabase.from("notifications").insert({
      org_id: orgId,
      commission_id: null,
      target_member_id: null,
      title: title.trim(),
      message: message.trim(),
    });

    setTitle("");
    setMessage("");
    setSubmitting(false);
    loadPosts();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Journal de l'amicale"
        subtitle="Actualités et annonces"
        backHref="/bureau/dashboard"
      />

      {/* Formulaire nouvelle publication */}
      <form
        onSubmit={handlePublish}
        className="rounded-[16px] bg-surface-elevated p-4 shadow-sm"
      >
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Nouvelle publication
        </h3>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {postTypes.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setPostType(pt.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  postType === pt.value
                    ? "bg-brand-500 text-white"
                    : "bg-surface-secondary text-content-secondary hover:text-content-primary"
                )}
              >
                <span className="text-[13px]">{pt.icon}</span>
                {pt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Titre de la publication"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[14px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-500 focus:outline-none"
          />
          <textarea
            placeholder="Contenu de votre publication..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-[14px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !title.trim() || !message.trim()}
            className="btn-gradient self-end rounded-[14px] px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Publication..." : "Publier"}
          </button>
        </div>
      </form>

      {/* Liste des publications */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Publications
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-content-muted">Chargement...</p>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="📰"
            title="Aucune publication"
            description="Les publications du journal apparaîtront ici"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map((post) => {
              const d = new Date(post.sent_at);
              return (
                <div
                  key={post.id}
                  className="rounded-[16px] bg-surface-elevated p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-rose-100 dark:bg-rose-500/20">
                      <span className="text-[16px]">
                        {postTypes.find((pt) => pt.value === post.type)?.icon || "📢"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-content-primary">
                        {post.title}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-[13px] text-content-secondary">
                        {post.message}
                      </p>
                      <p className="mt-1.5 text-[11px] text-content-muted">
                        {d.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        a{" "}
                        {d.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="shrink-0 text-[12px] font-medium text-red-500 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
