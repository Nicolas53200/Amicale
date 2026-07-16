import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";

export default async function JournalAmicalistePage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("notifications")
    .select("id, title, message, sent_at")
    .is("commission_id", null)
    .is("target_member_id", null)
    .order("sent_at", { ascending: false })
    .limit(50);

  const items = posts ?? [];

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Journal"
        subtitle="Actualites de votre amicale"
        backHref="/amicaliste/accueil"
      />

      {items.length === 0 ? (
        <EmptyState
          icon="📰"
          title="Aucune actualite"
          description="Les actualites de l'amicale apparaitront ici"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((post) => {
            const d = new Date(post.sent_at);
            return (
              <div
                key={post.id}
                className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-rose-100 dark:bg-rose-500/20">
                  <span className="text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400">
                    {d.toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                  <span className="text-[14px] font-bold leading-none text-rose-700 dark:text-rose-300">
                    {d.getDate()}
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
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
