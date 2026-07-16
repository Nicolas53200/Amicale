import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";

const reunionsPassees = [
  {
    id: "1",
    titre: "Bureau mensuel - Juin",
    date: "2026-06-15T18:00:00",
    lieu: "Salle du foyer",
    participants: 6,
    resume: "Budget Sainte-Barbe, point locations ete",
  },
  {
    id: "2",
    titre: "Bureau mensuel - Mai",
    date: "2026-05-18T18:00:00",
    lieu: "Salle du foyer",
    participants: 5,
    resume: "Bilan bal annuel, preparation voyages",
  },
  {
    id: "3",
    titre: "Bureau extraordinaire",
    date: "2026-05-02T19:00:00",
    lieu: "Visioconference",
    participants: 7,
    resume: "Vote nouveau reglement interieur",
  },
];

const prochaineReunion = {
  titre: "Bureau mensuel - Juillet",
  date: "2026-07-20T18:00:00",
  lieu: "Salle du foyer",
  ordreJour: [
    "Bilan financier du semestre",
    "Point inscriptions Sainte-Barbe",
    "Organisation kermesse",
    "Questions diverses",
  ],
};

export default function ReunionsPage() {
  const prochaine = prochaineReunion;
  const d = new Date(prochaine.date);

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Reunions"
        subtitle="Comptes-rendus du bureau"
        backHref="/bureau/dashboard"
      />

      {/* Prochaine reunion */}
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
                {prochaine.titre}
              </p>
              <p className="text-[12px] text-content-muted">
                {d.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {prochaine.lieu}
              </p>
            </div>
          </div>

          {prochaine.ordreJour.length > 0 && (
            <div className="mt-3 border-t border-border-subtle pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-content-muted">
                Ordre du jour
              </p>
              <ul className="flex flex-col gap-1">
                {prochaine.ordreJour.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13px] text-content-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Nouvelle reunion button */}
      <button
        type="button"
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

        {reunionsPassees.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Aucune reunion passee"
            description="Les comptes-rendus des reunions apparaitront ici"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {reunionsPassees.map((reunion) => {
              const rd = new Date(reunion.date);
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
                      {reunion.titre}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {reunion.participants} participants · {reunion.lieu}
                    </p>
                    {reunion.resume && (
                      <p className="mt-0.5 truncate text-[11px] text-content-muted">
                        {reunion.resume}
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
