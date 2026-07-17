"use client";

import { useState, useCallback } from "react";
import { GradientHeader } from "@/components/layout/gradient-header";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const filterTabs = [
  { value: "tous", label: "Tous" },
  { value: "reunion", label: "Reunions" },
  { value: "budget", label: "Budgets" },
  { value: "affiche", label: "Affiches" },
  { value: "bilan", label: "Bilans" },
];

const templateContents: Record<string, string> = {
  "Proces-verbal AG": `PROCES-VERBAL DE L'ASSEMBLEE GENERALE
Amicale des Sapeurs-Pompiers de [Ville]

Date : [Date]
Lieu : [Lieu]
Heure d'ouverture : [Heure]

Membres presents : [Nombre]
Pouvoirs recus : [Nombre]

ORDRE DU JOUR
1. Rapport moral du president
2. Rapport financier du tresorier
3. Vote du budget previsionnel
4. Questions diverses

DELIBERATIONS
[...]

Vote : Adopte a [X] voix pour, [Y] contre, [Z] abstentions.

Cloture de la seance a [Heure].

Le President                    Le Secretaire`,
  "Compte-rendu reunion": `COMPTE-RENDU DE REUNION DE BUREAU
Amicale des Sapeurs-Pompiers de [Ville]

Date : [Date]
Presents : [Noms]
Absents excuses : [Noms]

POINTS ABORDES

1. [Sujet]
   Decision : [...]

2. [Sujet]
   Decision : [...]

PROCHAINE REUNION
Date : [Date] - Lieu : [Lieu]`,
  "Demande de subvention": `DEMANDE DE SUBVENTION
Amicale des Sapeurs-Pompiers de [Ville]

A l'attention de : [Organisme]
Objet : Demande de subvention pour [Projet]

Madame, Monsieur,

Nous avons l'honneur de solliciter une subvention de [Montant] EUR
pour le financement de [Description du projet].

Pieces jointes :
- Budget previsionnel
- Statuts de l'association
- Dernier rapport d'activite`,
  "Bilan d'activite": `BILAN D'ACTIVITE [Annee]
Amicale des Sapeurs-Pompiers de [Ville]

RESUME
Nombre d'adherents : [X]
Evenements organises : [X]
Budget total : [X] EUR

EVENEMENTS REALISES
1. [Evenement] - [Date] - [Participants] participants
2. [Evenement] - [Date] - [Participants] participants

BILAN FINANCIER
Recettes : [X] EUR
Depenses : [X] EUR
Solde : [X] EUR`,
  "Fiche d'inscription": `FICHE D'INSCRIPTION
Evenement : [Nom de l'evenement]
Date : [Date]

Nom : ____________________
Prenom : ____________________
Telephone : ____________________
Nombre d'accompagnants : ____
Regime alimentaire : ____________________

Signature : ____________________`,
  "Planning benevoles": `PLANNING DES BENEVOLES
Evenement : [Nom]
Date : [Date]

EQUIPE MATIN (8h-13h)
- [Nom] : [Poste]
- [Nom] : [Poste]

EQUIPE APRES-MIDI (13h-18h)
- [Nom] : [Poste]
- [Nom] : [Poste]

EQUIPE SOIREE (18h-23h)
- [Nom] : [Poste]
- [Nom] : [Poste]`,
  "Budget previsionnel": `BUDGET PREVISIONNEL
Evenement : [Nom]
Date : [Date]

RECETTES
Cotisations        [X] EUR
Inscriptions       [X] EUR
Subventions        [X] EUR
Buvette            [X] EUR
TOTAL RECETTES     [X] EUR

DEPENSES
Location salle     [X] EUR
Traiteur           [X] EUR
Animation          [X] EUR
Communication      [X] EUR
Divers             [X] EUR
TOTAL DEPENSES     [X] EUR

RESULTAT PREVISIONNEL : [X] EUR`,
  "Affiche evenement": `[AFFICHE EVENEMENT]

L'AMICALE DES SAPEURS-POMPIERS
DE [VILLE]
VOUS INVITE A SON

[NOM DE L'EVENEMENT]

Le [Date] a [Heure]
[Lieu]

Tarif : [Prix] EUR
Reservation : [Contact]

Organisation : Amicale SP [Ville]`,
  "Newsletter": `NEWSLETTER - AMICALE SP [VILLE]
Edition [Mois Annee]

EDITO DU PRESIDENT
[Message du president]

A VENIR
- [Evenement 1] : [Date]
- [Evenement 2] : [Date]

RETOUR SUR
- [Evenement passe] : [Resume]

INFOS PRATIQUES
[Informations diverses]`,
  "Convocation reunion": `CONVOCATION
Reunion de [Bureau / Commission / AG]

Le President de l'Amicale des Sapeurs-Pompiers
de [Ville] a l'honneur de vous convier a la
reunion du [Type] qui se tiendra :

Le [Date] a [Heure]
[Lieu]

ORDRE DU JOUR
1. [Point 1]
2. [Point 2]
3. Questions diverses

Merci de confirmer votre presence.`,
  "Invitation": `L'AMICALE DES SAPEURS-POMPIERS
DE [VILLE]

A LE PLAISIR DE VOUS INVITER

[Evenement]

Le [Date] a [Heure]
[Lieu]

[Details de l'evenement]

RSVP avant le [Date]
Contact : [Email / Tel]`,
};

const categories = [
  {
    title: "Administratif",
    icon: "\u{1F4C1}",
    templates: [
      {
        icon: "\u{1F4C4}",
        title: "Proces-verbal AG",
        description: "Modele de PV pour assemblee generale",
        tags: ["reunion"],
      },
      {
        icon: "\u{1F4DD}",
        title: "Compte-rendu reunion",
        description: "Trame pour les reunions de bureau",
        tags: ["reunion"],
      },
      {
        icon: "\u{1F4E8}",
        title: "Demande de subvention",
        description: "Formulaire type de demande",
        tags: ["budget"],
      },
      {
        icon: "\u{1F4CA}",
        title: "Bilan d'activite",
        description: "Bilan evenement, commission ou annuel",
        tags: ["bilan"],
      },
    ],
  },
  {
    title: "Evenements",
    icon: "\u{1F389}",
    templates: [
      {
        icon: "\u{1F4CB}",
        title: "Fiche d'inscription",
        description: "Formulaire d'inscription participants",
        tags: ["reunion"],
      },
      {
        icon: "\u{1F4C5}",
        title: "Planning benevoles",
        description: "Organisation des equipes benevoles",
        tags: ["reunion"],
      },
      {
        icon: "\u{1F4B0}",
        title: "Budget previsionnel",
        description: "Estimation des couts et recettes",
        tags: ["budget"],
      },
      {
        icon: "\u{1F5BC}️",
        title: "Affiche evenement",
        description: "Bal, repas, loto, voyage",
        tags: ["affiche"],
      },
    ],
  },
  {
    title: "Communication",
    icon: "\u{1F4E3}",
    templates: [
      {
        icon: "\u{1F4F0}",
        title: "Newsletter",
        description: "Modele de lettre d'information",
        tags: ["affiche"],
      },
      {
        icon: "\u{2709}️",
        title: "Convocation reunion",
        description: "Bureau, commission ou AG",
        tags: ["reunion"],
      },
      {
        icon: "\u{2709}️",
        title: "Invitation",
        description: "Carton d'invitation officiel",
        tags: ["affiche"],
      },
    ],
  },
];

export default function ModelesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");
  const [previewTemplate, setPreviewTemplate] = useState<{ icon: string; title: string; description: string } | null>(null);
  const { showToast } = useToast();

  const copyTemplate = useCallback(async (title: string) => {
    const content = templateContents[title];
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        showToast(`"${title}" copie dans le presse-papier`, "success");
      } catch {
        showToast(`"${title}" copie`, "success");
      }
    }
  }, [showToast]);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      templates: cat.templates.filter((t) => {
        const matchSearch = search === "" ||
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === "tous" || t.tags.includes(activeFilter);
        return matchSearch && matchFilter;
      }),
    }))
    .filter((cat) => cat.templates.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Bibliotheque de modeles"
        subtitle="Documents prets a utiliser"
        backHref="/bureau/dashboard"
      />

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Rechercher un modele : PV, affiche, budget..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[14px] border border-border bg-surface-elevated py-3 pl-10 pr-4 text-[13px] text-content-primary placeholder:text-content-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
              activeFilter === tab.value
                ? "bg-brand-500 text-white"
                : "bg-surface-elevated text-content-secondary hover:text-content-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-content-muted">Aucun modele trouve</p>
        </div>
      ) : (
        filtered.map((category) => (
          <div key={category.title}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base">{category.icon}</span>
              <h2 className="text-[14px] font-bold text-content-primary">
                {category.title}
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {category.templates.map((template) => (
                <div
                  key={template.title}
                  className="flex items-center gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                    <span className="text-lg">{template.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {template.title}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-surface-secondary text-content-muted transition-colors hover:text-content-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyTemplate(template.title)}
                      className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-surface-secondary text-content-muted transition-colors hover:text-content-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-[20px] bg-surface-elevated shadow-xl sm:rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
                  <span className="text-lg">{previewTemplate.icon}</span>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-content-primary">{previewTemplate.title}</p>
                  <p className="text-[11px] text-content-muted">{previewTemplate.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-content-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-5">
              <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-content-primary">
                {templateContents[previewTemplate.title] || "Contenu du modele a venir..."}
              </pre>
            </div>
            <div className="flex gap-2 border-t border-border p-4">
              <button
                type="button"
                onClick={() => { copyTemplate(previewTemplate.title); setPreviewTemplate(null); }}
                className="btn-gradient flex flex-1 items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copier le modele
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="rounded-[14px] bg-surface-secondary px-4 py-3 text-[13px] font-semibold text-content-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
