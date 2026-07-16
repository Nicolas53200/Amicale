import { GradientHeader } from "@/components/layout/gradient-header";

const categories = [
  {
    title: "Administratif",
    icon: "📁",
    templates: [
      {
        icon: "📄",
        title: "Procès-verbal AG",
        description: "Modèle de PV pour assemblée générale",
      },
      {
        icon: "📝",
        title: "Compte-rendu réunion",
        description: "Trame pour les réunions de bureau",
      },
      {
        icon: "📨",
        title: "Demande de subvention",
        description: "Formulaire type de demande",
      },
    ],
  },
  {
    title: "Événements",
    icon: "🎉",
    templates: [
      {
        icon: "📋",
        title: "Fiche d'inscription",
        description: "Formulaire d'inscription participants",
      },
      {
        icon: "📅",
        title: "Planning bénévoles",
        description: "Organisation des équipes bénévoles",
      },
      {
        icon: "💰",
        title: "Budget prévisionnel",
        description: "Estimation des coûts et recettes",
      },
    ],
  },
  {
    title: "Communication",
    icon: "📣",
    templates: [
      {
        icon: "🖼️",
        title: "Affiche type",
        description: "Gabarit d'affiche pour événements",
      },
      {
        icon: "📰",
        title: "Newsletter",
        description: "Modèle de lettre d'information",
      },
      {
        icon: "✉️",
        title: "Invitation",
        description: "Carton d'invitation officiel",
      },
    ],
  },
];

export default function ModelesPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Bibliothèque de modèles"
        subtitle="Documents et formulaires types"
        backHref="/bureau/dashboard"
      />

      {categories.map((category) => (
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
                <button className="btn-gradient shrink-0 rounded-[10px] px-3 py-1.5 text-[11px] font-semibold text-white">
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
