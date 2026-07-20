"use client";

import { useState } from "react";

interface TourStep {
  title: string;
  description: string;
  icon: string;
  image?: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Bienvenue !",
    description:
      "Découvrez votre application Amicale en quelques étapes. Elle regroupe tout ce dont vous avez besoin pour suivre la vie de votre amicale de sapeurs-pompiers.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "Page d'accueil",
    description:
      "Votre page d'accueil affiche un carrousel avec les prochains événements et voyages, les dernières actualités et des raccourcis vers les sections principales. C'est votre point de départ.",
    icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  },
  {
    title: "Événements",
    description:
      "Consultez tous les événements organisés par l'amicale : repas, bals, tournois sportifs, journées familles... Inscrivez-vous en quelques clics et choisissez le nombre de participants. Vous pouvez aussi vous inscrire comme bénévole.",
    icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  },
  {
    title: "Voyages",
    description:
      "Parcourez les voyages proposés : week-ends, séjours, colonies de vacances... Choisissez le nombre d'adultes et d'enfants, le prix total est calculé automatiquement. Suivez le statut de votre inscription et de votre paiement.",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  },
  {
    title: "Locations",
    description:
      "Réservez les biens de l'amicale : appartement de vacances, barnum, remorque, emplacement camping... Consultez les photos, les tarifs journaliers et le calendrier de disponibilité. Faites votre demande et suivez sa validation.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Commissions",
    description:
      "L'amicale est organisée en commissions thématiques : voyages, événements, sport, Noël, Sainte-Barbe, solidarité... Chaque commission a sa propre page avec ses membres, ses événements et ses documents.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Calendrier",
    description:
      "Le calendrier regroupe automatiquement tous les événements, voyages et réservations. Naviguez par mois pour avoir une vue d'ensemble des activités. Appuyez sur une date pour voir les détails.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Galerie photos",
    description:
      "Retrouvez les photos des événements, voyages et moments forts de l'amicale. Les albums sont alimentés par le bureau et les commissions.",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Messagerie & Notifications",
    description:
      "Échangez avec le bureau et les autres membres via la messagerie interne. Les notifications vous alertent des nouveaux événements, confirmations d'inscription et messages importants. Retrouvez-les depuis l'icône cloche.",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  {
    title: "Cotisations",
    description:
      "Consultez le montant de votre cotisation annuelle et son statut (à jour, en attente, en retard). L'historique de vos paiements est également disponible.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Profil",
    description:
      "Gérez vos informations personnelles, changez votre mot de passe et configurez vos préférences de notification. Votre profil affiche aussi votre grade, votre centre et votre rôle dans l'amicale.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    title: "Vous êtes prêt !",
    description:
      "Vous connaissez maintenant les principales fonctionnalités de l'application. N'hésitez pas à explorer et à contacter le bureau via la messagerie si vous avez des questions. Bonne navigation !",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export function GuidedTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = tourSteps[step]!;
  const isLast = step === tourSteps.length - 1;
  const isFirst = step === 0;
  const progress = ((step + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 animate-in fade-in" onClick={onClose} />

      <div className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-[20px] bg-surface-elevated shadow-lg animate-in zoom-in-95 fade-in">
        {/* Progress bar */}
        <div className="h-1 bg-surface-secondary">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step counter */}
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

        {/* Content */}
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

        {/* Navigation */}
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
              if (isLast) {
                onClose();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 rounded-[14px] bg-brand-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
          >
            {isLast ? "Terminer" : isFirst ? "Commencer" : "Suivant"}
          </button>
        </div>

        {/* Dot indicators */}
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
