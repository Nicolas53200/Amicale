import { getChangelogs } from "@/lib/actions/changelogs";
import { GradientHeader } from "@/components/layout/gradient-header";

interface Changelog {
  id: string;
  version: string;
  title: string;
  description: string | null;
  changes: string[];
  published_at: string;
}

export default async function NouveautesAmicalistePage() {
  const changelogs = (await getChangelogs()) as Changelog[];

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Nouveautés"
        subtitle="Les dernières mises à jour de l'application"
      />

      {changelogs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[14px] bg-surface-elevated py-16 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-content-primary">Aucune nouveauté</p>
          <p className="mt-1 text-[13px] text-content-secondary">
            Vous serez notifié des prochaines mises à jour
          </p>
        </div>
      )}

      <div className="space-y-3">
        {changelogs.map((entry) => (
          <div
            key={entry.id}
            className="rounded-[14px] bg-surface-elevated p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
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
