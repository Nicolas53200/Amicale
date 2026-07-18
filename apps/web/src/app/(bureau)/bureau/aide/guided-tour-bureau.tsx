"use client";

import { useState } from "react";

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Espace Bureau",
    description:
      "Bienvenue dans l'espace d'administration ! Ici, vous gérez l'ensemble de votre amicale : membres, événements, voyages, locations, comptabilité et paramètres. Seuls les membres du bureau y ont accès.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
  },
  {
    title: "Tableau de bord",
    description:
      "Le dashboard affiche une vue d'ensemble : nombre de membres, budget, événements à venir, écritures en attente. C'est votre point de départ pour piloter l'amicale au quotidien.",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
  {
    title: "Gestion des membres",
    description:
      "Ajoutez des membres manuellement ou invitez-les par email. Gérez les rôles (président, trésorier, secrétaire, commissaire, membre), les statuts (actif, invité, inactif) et les accès bureau. Chaque membre a sa fiche détaillée.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Commissions",
    description:
      "Organisez votre amicale en commissions thématiques. Chaque commission a son budget, ses membres, ses documents et ses événements. Les commissions fixes (voyages, événements, sport…) sont prédéfinies. Créez des commissions personnalisées selon vos besoins.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    title: "Événements & Voyages",
    description:
      "Créez des événements (repas, bals, tournois…) et des voyages (week-ends, séjours, colonies). Gérez les inscriptions, les paiements et les bénévoles. Rattachez-les à une commission pour un suivi budgétaire précis.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Locations",
    description:
      "Gérez le parc de biens locatifs : ajoutez des photos, fixez les tarifs et cautions, validez ou refusez les demandes de réservation. Le calendrier de disponibilité se met à jour automatiquement.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    title: "Comptabilité",
    description:
      "Enregistrez les dépenses et recettes par commission. Validez les notes de frais, suivez les budgets et exportez les données pour vos rapports. Le solde et les statistiques sont calculés en temps réel.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    title: "Nouveautés",
    description:
      "Publiez des notes de mise à jour pour informer vos membres des nouvelles fonctionnalités. Ils verront automatiquement une popup à leur prochaine connexion avec le détail des changements.",
    icon: "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83",
  },
  {
    title: "Paramètres",
    description:
      "Configurez votre amicale : nom, modules actifs (locations, voyages, événements, bons cadeaux), couleur du thème. Ces réglages s'appliquent à tous les membres de votre amicale.",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
  {
    title: "Vous êtes prêt !",
    description:
      "Vous maîtrisez maintenant les outils du bureau. Pensez à consulter la FAQ ci-dessous pour les questions détaillées. Et n'oubliez pas de publier une nouveauté quand vous ajoutez quelque chose pour vos membres !",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export function GuidedTourBureau({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = tourSteps[step]!;
  const isLast = step === tourSteps.length - 1;
  const isFirst = step === 0;
  const progress = ((step + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 animate-in fade-in" onClick={onClose} />

      <div className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-[20px] bg-surface-elevated shadow-lg animate-in zoom-in-95 fade-in">
        <div className="h-1 bg-surface-secondary">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-6 pt-5">
          <span className="text-[12px] font-semibold text-content-muted">
            {step + 1} / {tourSteps.length}
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-content-secondary hover:text-content-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-500"
            >
              <path d={current.icon} />
            </svg>
          </div>

          <h2 className="mb-3 text-[19px] font-bold text-content-primary">
            {current.title}
          </h2>
          <p className="text-[14px] leading-relaxed text-content-secondary">
            {current.description}
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 pb-6">
          {!isFirst && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-content-secondary transition-colors hover:bg-border-subtle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) onClose();
              else setStep(step + 1);
            }}
            className="flex-1 rounded-[14px] bg-brand-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
          >
            {isLast ? "Terminer" : isFirst ? "Commencer" : "Suivant"}
          </button>
        </div>

        <div className="flex justify-center gap-1.5 pb-5">
          {tourSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-brand-500"
                  : i < step
                    ? "w-1.5 bg-brand-300 dark:bg-brand-500/40"
                    : "w-1.5 bg-content-muted/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
