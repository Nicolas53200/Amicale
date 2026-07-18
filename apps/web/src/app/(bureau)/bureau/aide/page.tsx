"use client";

import { useState } from "react";
import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { GuidedTourBureau } from "./guided-tour-bureau";

const faqBureau = [
  {
    category: "Gestion des membres",
    items: [
      {
        question: "Comment ajouter un nouveau membre ?",
        answer:
          "Dans Membres, appuyez sur « Ajouter un membre ». Renseignez son nom, prénom et email. Un code d'invitation sera généré et envoyé par email automatiquement. Le membre pourra rejoindre l'amicale en suivant le lien reçu.",
      },
      {
        question: "Comment inviter un membre par email ?",
        answer:
          "Utilisez le bouton « Inviter » sur la page Membres. Saisissez l'email de la personne. Elle recevra un email avec un lien d'invitation sécurisé pour créer son compte et rejoindre l'amicale.",
      },
      {
        question: "Comment modifier le rôle d'un membre ?",
        answer:
          "Ouvrez la fiche du membre, puis modifiez son rôle (membre, commissaire) et son statut bureau (président, trésorier, secrétaire). Les membres du bureau ont accès à l'espace d'administration.",
      },
      {
        question: "Comment gérer les statuts des membres ?",
        answer:
          "Chaque membre a un statut : invité (en attente), actif (compte créé), inactif (désactivé). Vous pouvez changer le statut depuis la fiche du membre. Un membre inactif ne peut plus se connecter.",
      },
    ],
  },
  {
    category: "Événements",
    items: [
      {
        question: "Comment créer un événement ?",
        answer:
          "Dans Événements, appuyez sur « Nouvel événement ». Renseignez le titre, la date, le lieu, le prix, le nombre max de participants et la description. Vous pouvez aussi limiter le nombre de bénévoles et rattacher l'événement à une commission.",
      },
      {
        question: "Comment gérer les inscriptions ?",
        answer:
          "Sur la fiche d'un événement, vous voyez la liste complète des inscrits et des bénévoles avec le nombre de participants. Vous pouvez suivre le remplissage en temps réel.",
      },
      {
        question: "Comment modifier ou supprimer un événement ?",
        answer:
          "Ouvrez la fiche de l'événement et appuyez sur « Modifier ». Vous pouvez changer toutes les informations. Pour supprimer, utilisez le bouton « Supprimer » en bas de la fiche (attention, cette action est irréversible).",
      },
    ],
  },
  {
    category: "Voyages",
    items: [
      {
        question: "Comment créer un voyage ?",
        answer:
          "Dans Voyages, appuyez sur « Nouveau voyage ». Renseignez la destination, les dates, le prix adulte et enfant, le nombre max de places et la description. Vous pouvez rattacher le voyage à une commission.",
      },
      {
        question: "Comment suivre les inscriptions et paiements ?",
        answer:
          "La fiche d'un voyage liste tous les inscrits avec le nombre d'adultes, d'enfants, le montant total et le statut de paiement. Vous pouvez valider les paiements depuis cette vue.",
      },
    ],
  },
  {
    category: "Locations",
    items: [
      {
        question: "Comment ajouter un bien locatif ?",
        answer:
          "Dans Locations, appuyez sur « Nouveau bien ». Renseignez le nom, le type, le tarif journalier, la caution, les règles d'utilisation et ajoutez des photos. Le bien sera immédiatement visible par les membres.",
      },
      {
        question: "Comment gérer les demandes de réservation ?",
        answer:
          "Les demandes arrivent en statut « en attente ». Ouvrez la fiche du bien pour voir les réservations. Vous pouvez accepter ou refuser chaque demande. Le membre est notifié du résultat.",
      },
      {
        question: "Comment gérer les photos d'un bien ?",
        answer:
          "Sur la fiche du bien en mode édition, vous pouvez ajouter, supprimer et réorganiser les photos. Définissez une photo de couverture qui sera affichée dans la liste des biens.",
      },
    ],
  },
  {
    category: "Commissions",
    items: [
      {
        question: "Comment créer une commission ?",
        answer:
          "Dans Commissions, appuyez sur « Nouvelle commission ». Choisissez un nom, un modèle (simple, événement, location, voyage), une icône, une couleur et un budget. Les commissions fixes (prédéfinies) ne peuvent pas être supprimées.",
      },
      {
        question: "Comment gérer les membres d'une commission ?",
        answer:
          "Sur la fiche d'une commission, ajoutez ou retirez des membres. Chaque membre peut avoir un rôle au sein de la commission (membre, responsable). Les membres de la commission ont accès à ses documents et événements.",
      },
      {
        question: "Comment gérer le budget d'une commission ?",
        answer:
          "Le budget est défini lors de la création. Chaque commission peut enregistrer ses dépenses et recettes via la comptabilité. Le solde est calculé automatiquement et visible sur la fiche de la commission.",
      },
    ],
  },
  {
    category: "Comptabilité",
    items: [
      {
        question: "Comment enregistrer une dépense ou une recette ?",
        answer:
          "Dans Comptabilité, appuyez sur « Nouvelle écriture ». Choisissez la commission, le type (dépense/recette), le libellé, le montant et le fournisseur. Joignez un justificatif si nécessaire. Les dépenses passent en statut « en attente » avant validation.",
      },
      {
        question: "Comment valider une dépense ?",
        answer:
          "Les dépenses en attente apparaissent dans la liste avec un badge orange. Appuyez pour ouvrir le détail, vérifiez le justificatif, puis validez ou rejetez. Vous pouvez aussi choisir le mode de paiement lors de la validation.",
      },
      {
        question: "Comment consulter les statistiques financières ?",
        answer:
          "Le tableau de bord comptabilité affiche le budget total, les recettes, les dépenses, le solde et le nombre d'écritures en attente. Vous pouvez filtrer par commission pour voir le détail par secteur.",
      },
    ],
  },
  {
    category: "Paramètres & Nouveautés",
    items: [
      {
        question: "Comment configurer les modules de l'amicale ?",
        answer:
          "Dans Paramètres, activez ou désactivez les modules : locations, voyages, événements, bons cadeaux. Vous pouvez aussi personnaliser le nom de l'amicale et la couleur du thème.",
      },
      {
        question: "Comment publier une note de mise à jour ?",
        answer:
          "Dans Nouveautés, appuyez sur « Publier une nouveauté ». Renseignez le numéro de version, le titre, la description et la liste des changements. Les membres verront automatiquement une popup à leur prochaine connexion.",
      },
      {
        question: "Comment exporter des données ?",
        answer:
          "Plusieurs pages disposent d'un bouton d'export (CSV/Excel) : membres, comptabilité, inscriptions événements et voyages. Utilisez ces exports pour vos documents administratifs et vos assemblées générales.",
      },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
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
      className={`shrink-0 text-content-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function AideBureauPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [showTour, setShowTour] = useState(false);

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Guide du bureau"
        subtitle="Aide à l'administration"
      />

      {/* Tour guidé bureau */}
      <div className="rounded-[16px] bg-gradient-to-br from-brand-400 to-brand-600 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-bold text-white">
              Visite guidée du bureau
            </h3>
            <p className="mt-1 text-[13px] text-white/80">
              Découvrez les outils d&apos;administration de votre amicale
            </p>
            <button
              onClick={() => setShowTour(true)}
              className="mt-3 rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-white/90 active:bg-white/80"
            >
              Lancer la visite
            </button>
          </div>
        </div>
      </div>

      {showTour && <GuidedTourBureau onClose={() => setShowTour(false)} />}

      {faqBureau.map((section) => (
        <div key={section.category}>
          <h3 className="mb-2 text-[14px] font-bold text-content-primary">
            {section.category}
          </h3>
          <div className="overflow-hidden rounded-[16px] bg-surface-elevated shadow-sm">
            {section.items.map((item, idx) => {
              const key = `${section.category}-${idx}`;
              const isOpen = !!openItems[key];
              return (
                <div
                  key={key}
                  className={
                    idx < section.items.length - 1
                      ? "border-b border-border-subtle"
                      : ""
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors active:bg-surface-secondary"
                  >
                    <span className="text-[13px] font-semibold text-content-primary">
                      {item.question}
                    </span>
                    <ChevronIcon open={isOpen} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-[13px] leading-relaxed text-content-secondary">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Lien vers la FAQ amicaliste */}
      <Link
        href="/amicaliste/aide"
        className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm transition-colors active:bg-surface-secondary"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-content-primary">FAQ Amicaliste</p>
          <p className="text-[12px] text-content-muted">Consultez la FAQ visible par les membres</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}
