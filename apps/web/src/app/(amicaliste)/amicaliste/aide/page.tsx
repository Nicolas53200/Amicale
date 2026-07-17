"use client";

import { useState } from "react";
import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { useToast } from "@/components/ui/toast";

const faqData = [
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
          "Depuis la page Événements, appuyez sur l’événement qui vous intéresse puis sur le bouton « S’inscrire ». Vous recevrez une confirmation par notification.",
      },
      {
        question: "Puis-je annuler mon inscription ?",
        answer:
          "Oui, retournez sur la fiche de l’événement et appuyez sur « Annuler mon inscription ». Attention, certains événements ont une date limite d’annulation.",
      },
    ],
  },
  {
    category: "Voyages",
    items: [
      {
        question: "Comment réserver un voyage ?",
        answer:
          "Consultez les voyages disponibles dans l’onglet Voyages. Sélectionnez celui qui vous intéresse, choisissez le nombre de participants et validez votre inscription.",
      },
      {
        question: "Comment fonctionne le paiement des voyages ?",
        answer:
          "Le paiement s’effectue auprès du bureau de l’amicale. Vous pouvez payer en une ou plusieurs fois selon les modalités indiquées sur la fiche du voyage.",
      },
    ],
  },
  {
    category: "Locations",
    items: [
      {
        question: "Quels biens sont disponibles à la location ?",
        answer:
          "L’amicale met à disposition plusieurs biens : appartements, barnums, remorques et emplacements camping. Consultez la page Locations pour voir les disponibilités.",
      },
      {
        question: "Comment faire une demande de location ?",
        answer:
          "Sur la fiche du bien souhaité, appuyez sur « Demander une réservation ». Sélectionnez vos dates et validez. Le bureau traitera votre demande dans les meilleurs délais.",
      },
      {
        question: "Quels sont les tarifs de location ?",
        answer:
          "Les tarifs varient selon le bien et la durée. Ils sont affichés sur chaque fiche de bien. Les membres de l’amicale bénéficient de tarifs préférentiels.",
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
  const { showToast } = useToast();

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Aide & FAQ"
        subtitle="Questions fréquentes"
        backHref="/amicaliste/accueil"
      />

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
