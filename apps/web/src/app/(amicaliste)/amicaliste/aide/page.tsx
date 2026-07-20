"use client";

import { useState } from "react";
import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { useToast } from "@/components/ui/toast";
import { GuidedTour } from "@/components/layout/guided-tour";

const faqData = [
  {
    category: "Premiers pas",
    items: [
      {
        question: "Comment fonctionne l’application ?",
        answer:
          "L’application vous permet de gérer votre vie d’amicaliste : consulter les événements et voyages, réserver des biens, suivre vos cotisations, échanger avec les autres membres et le bureau. Tout est accessible depuis le menu en bas de l’écran.",
      },
      {
        question: "Comment installer l’application sur mon téléphone ?",
        answer:
          "Sur iPhone : ouvrez l’app dans Safari, appuyez sur le bouton Partager (carré avec flèche), puis « Sur l’écran d’accueil ». Sur Android : Chrome vous proposera automatiquement un bouton « Installer », ou appuyez sur le menu ⋮ puis « Installer l’application ». L’app s’ouvrira ensuite comme une application classique.",
      },
      {
        question: "Comment naviguer dans l’application ?",
        answer:
          "Le menu en bas de l’écran vous donne accès aux sections principales : Accueil, Événements, Voyages, Locations et Plus. La section « Plus » regroupe les commissions, la galerie, le calendrier, les cotisations, la messagerie et les notifications.",
      },
    ],
  },
  {
    category: "Mon compte",
    items: [
      {
        question: "Comment modifier mes informations personnelles ?",
        answer:
          "Rendez-vous dans l’onglet Profil accessible depuis le menu en bas de l’écran. Vous pourrez y modifier votre nom, prénom, email, téléphone et adresse.",
      },
      {
        question: "Comment changer mon mot de passe ?",
        answer:
          "Dans votre Profil, appuyez sur « Modifier le mot de passe ». Saisissez votre ancien mot de passe, puis le nouveau. Un email de confirmation vous sera envoyé.",
      },
      {
        question: "Comment contacter le bureau de l’amicale ?",
        answer:
          "Utilisez la messagerie interne accessible depuis l’onglet Messages. Vous pouvez écrire directement au bureau ou à un membre en particulier.",
      },
    ],
  },
  {
    category: "Événements",
    items: [
      {
        question: "Comment m’inscrire à un événement ?",
        answer:
          "Depuis la page Événements, appuyez sur l’événement qui vous intéresse puis sur le bouton « S’inscrire ». Choisissez le nombre de participants et validez. Vous recevrez une confirmation par notification.",
      },
      {
        question: "Puis-je annuler mon inscription ?",
        answer:
          "Oui, retournez sur la fiche de l’événement et appuyez sur « Annuler mon inscription ». Attention, certains événements ont une date limite d’annulation.",
      },
      {
        question: "Comment devenir bénévole pour un événement ?",
        answer:
          "Sur la fiche de l’événement, si des places bénévoles sont disponibles, un bouton « S’inscrire comme bénévole » apparaît. Sélectionnez le poste souhaité et validez votre inscription.",
      },
    ],
  },
  {
    category: "Voyages",
    items: [
      {
        question: "Comment réserver un voyage ?",
        answer:
          "Consultez les voyages disponibles dans l’onglet Voyages. Sélectionnez celui qui vous intéresse, choisissez le nombre d’adultes et d’enfants, puis validez votre inscription. Le montant total est calculé automatiquement.",
      },
      {
        question: "Comment fonctionne le paiement des voyages ?",
        answer:
          "Le paiement s’effectue auprès du bureau de l’amicale. Vous pouvez payer en une ou plusieurs fois selon les modalités indiquées sur la fiche du voyage.",
      },
      {
        question: "Comment annuler mon inscription à un voyage ?",
        answer:
          "Sur la fiche du voyage, appuyez sur « Annuler mon inscription ». Les conditions d’annulation et de remboursement varient selon le voyage et la date d’annulation.",
      },
    ],
  },
  {
    category: "Locations",
    items: [
      {
        question: "Quels biens sont disponibles à la location ?",
        answer:
          "L’amicale met à disposition plusieurs biens : appartements, barnums, remorques et emplacements camping. Consultez la page Locations pour voir les disponibilités et les photos.",
      },
      {
        question: "Comment faire une demande de location ?",
        answer:
          "Sur la fiche du bien souhaité, appuyez sur « Demander une réservation ». Sélectionnez vos dates de début et fin, ajoutez éventuellement des notes, puis validez. Le bureau traitera votre demande dans les meilleurs délais.",
      },
      {
        question: "Quels sont les tarifs de location ?",
        answer:
          "Les tarifs journaliers et le montant de la caution sont affichés sur chaque fiche de bien. Le montant total est calculé automatiquement en fonction de la durée de votre réservation.",
      },
      {
        question: "Comment suivre le statut de ma réservation ?",
        answer:
          "Retournez sur la fiche du bien. Votre réservation apparaît avec son statut : en attente de validation, confirmée ou refusée. Vous recevrez une notification quand le bureau aura traité votre demande.",
      },
    ],
  },
  {
    category: "Commissions",
    items: [
      {
        question: "Qu’est-ce qu’une commission ?",
        answer:
          "Une commission est un groupe de travail thématique au sein de l’amicale (ex : commission voyages, événements, sport, Noël…). Chaque commission organise ses activités, gère son budget et communique avec ses membres.",
      },
      {
        question: "Comment rejoindre une commission ?",
        answer:
          "Consultez la liste des commissions depuis le menu. Si des places sont disponibles, vous pouvez demander à rejoindre une commission. Le responsable de la commission validera votre demande.",
      },
      {
        question: "Comment voir les activités d’une commission ?",
        answer:
          "Appuyez sur une commission pour voir sa fiche détaillée : ses membres, ses événements à venir, ses documents partagés et son budget.",
      },
    ],
  },
  {
    category: "Calendrier & Galerie",
    items: [
      {
        question: "Comment fonctionne le calendrier ?",
        answer:
          "Le calendrier regroupe automatiquement tous les événements, voyages et réservations de l’amicale. Vous pouvez naviguer par mois et appuyer sur une date pour voir les activités prévues.",
      },
      {
        question: "Comment consulter la galerie photos ?",
        answer:
          "La galerie est accessible depuis le menu « Plus ». Elle regroupe les photos des événements, voyages et activités de l’amicale, classées par album.",
      },
    ],
  },
  {
    category: "Messagerie",
    items: [
      {
        question: "Comment envoyer un message au bureau ?",
        answer:
          "Allez dans l’onglet Messagerie et sélectionnez la conversation avec le bureau, ou créez une nouvelle conversation. Vos messages sont privés et sécurisés.",
      },
      {
        question: "Puis-je envoyer des messages à d’autres membres ?",
        answer:
          "Oui, la messagerie permet d’échanger avec tous les membres de l’amicale. Créez une nouvelle conversation et sélectionnez le destinataire.",
      },
    ],
  },
  {
    category: "Notifications",
    items: [
      {
        question: "Comment fonctionnent les notifications ?",
        answer:
          "Vous recevez des notifications pour les événements importants : nouveaux événements, confirmation d’inscription, rappels, messages du bureau. Consultez-les depuis l’icône cloche dans le menu.",
      },
      {
        question: "Comment gérer mes préférences de notification ?",
        answer:
          "Dans votre Profil, section « Notifications », vous pouvez choisir quels types de notifications recevoir : événements, voyages, messages, rappels.",
      },
    ],
  },
  {
    category: "Cotisations",
    items: [
      {
        question: "Quel est le montant de la cotisation ?",
        answer:
          "Le montant est fixé chaque année lors de l’assemblée générale. Consultez la page Cotisations pour connaître le montant en vigueur et votre statut de paiement.",
      },
      {
        question: "Comment payer ma cotisation ?",
        answer:
          "Vous pouvez payer par virement bancaire, chèque ou espèces auprès du trésorier. Le détail des moyens de paiement est disponible dans la page Cotisations.",
      },
      {
        question: "Comment savoir si ma cotisation est à jour ?",
        answer:
          "La page Cotisations affiche votre statut : à jour, en retard ou non payée. Vous pouvez aussi consulter l’historique de vos paiements.",
      },
    ],
  },
  {
    category: "Nouveautés & Mises à jour",
    items: [
      {
        question: "Comment savoir quand l’application est mise à jour ?",
        answer:
          "Une popup « Nouveautés » s’affiche automatiquement à votre connexion quand de nouvelles fonctionnalités sont disponibles. Vous pouvez aussi consulter l’historique complet dans la page Nouveautés.",
      },
      {
        question: "L’application se met-elle à jour automatiquement ?",
        answer:
          "Oui, l’application se met à jour automatiquement à chaque visite. Aucune action de votre part n’est nécessaire — vous bénéficiez toujours de la dernière version.",
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

const feedbackTypes = [
  { value: "bug", label: "Signaler un bug", icon: "🐛" },
  { value: "idea", label: "Proposer une idée", icon: "💡" },
  { value: "question", label: "Poser une question", icon: "❓" },
];

export default function AidePage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [feedbackType, setFeedbackType] = useState("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [showTour, setShowTour] = useState(false);
  const { showToast } = useToast();

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Aide & FAQ"
        subtitle="Guide d'utilisation"
        backHref="/amicaliste/accueil"
      />

      {/* Tour guidé */}
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
              Visite guidée
            </h3>
            <p className="mt-1 text-[13px] text-white/80">
              Découvrez les fonctionnalités de l&apos;application en quelques étapes
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

      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}

      {faqData.map((section) => (
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

      {/* Feedback form */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Nous faire un retour
        </h3>
        <div className="mb-3 flex gap-2">
          {feedbackTypes.map((ft) => (
            <button
              key={ft.value}
              type="button"
              onClick={() => setFeedbackType(ft.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-[12px] border-2 p-2.5 transition-all ${
                feedbackType === ft.value
                  ? "border-brand-400 bg-brand-50 dark:border-brand-500/50 dark:bg-brand-500/10"
                  : "border-transparent bg-surface-secondary"
              }`}
            >
              <span className="text-lg">{ft.icon}</span>
              <span className="text-[10px] font-semibold text-content-primary">{ft.label}</span>
            </button>
          ))}
        </div>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={3}
          placeholder="Décrivez votre retour..."
          className="mb-3 w-full resize-none rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        />
        <button
          type="button"
          onClick={() => {
            if (feedbackText.trim()) {
              showToast("Merci pour votre retour !", "success");
              setFeedbackText("");
            }
          }}
          disabled={!feedbackText.trim()}
          className="btn-gradient w-full rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>

      {/* Contact bureau card */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <span className="text-lg">💬</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-content-primary">
              Besoin d&apos;aide supplémentaire ?
            </p>
            <p className="mt-1 text-[12px] text-content-muted">
              Contactez directement le bureau de l&apos;amicale via la
              messagerie interne.
            </p>
            <Link
              href="/amicaliste/messagerie"
              className="btn-gradient mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contacter le bureau
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
