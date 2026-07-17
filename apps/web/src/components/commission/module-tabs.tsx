"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleCompta } from "./module-compta";
import { ModuleDocuments } from "./module-documents";
import { ModuleMembres } from "./module-membres";
import { ModuleNotifications } from "./module-notifications";
import { ModuleEvenements } from "./module-evenements";
import { ModuleVoyages } from "./module-voyages";
import { ModuleLocations } from "./module-locations";
import { NoelBureau } from "./noel-bureau";
import { NoelAmicaliste } from "./noel-amicaliste";
import { FdfBureau } from "./fdf-bureau";
import { FdfAmicaliste } from "./fdf-amicaliste";
import { SainteBarbeBureau } from "./saintebarbe-bureau";
import { SainteBarbeAmicaliste } from "./saintebarbe-amicaliste";
import { SolidariteBureau } from "./solidarite-bureau";
import { SolidariteAmicaliste } from "./solidarite-amicaliste";
import { FoyerBureau } from "./foyer-bureau";

interface ModuleTabsProps {
  commissionId: string;
  commissionName: string;
  features: string[];
  budget: number;
  isReadOnly?: boolean;
}

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  evenements: { label: "Evenements", icon: "📅" },
  voyages: { label: "Voyages", icon: "✈️" },
  locations: { label: "Locations", icon: "🏠" },
  compta: { label: "Comptabilite", icon: "💰" },
  documents: { label: "Documents", icon: "📄" },
  membres: { label: "Membres", icon: "👥" },
  notifications: { label: "Notifications", icon: "🔔" },
};

const SPECIALIZED_KEYWORDS: Record<string, string> = {
  "noel": "noel",
  "noël": "noel",
  "arbre": "noel",
  "fdf": "fdf",
  "femmes": "fdf",
  "fête des femmes": "fdf",
  "sainte-barbe": "saintebarbe",
  "sainte barbe": "saintebarbe",
  "saintebarbe": "saintebarbe",
  "solidarite": "solidarite",
  "solidarité": "solidarite",
  "action sociale": "solidarite",
  "foyer": "foyer",
};

function detectSpecialized(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [keyword, type] of Object.entries(SPECIALIZED_KEYWORDS)) {
    if (lower.includes(keyword)) return type;
  }
  return null;
}

export function ModuleTabs({
  commissionId,
  commissionName,
  features,
  budget,
  isReadOnly = false,
}: ModuleTabsProps) {
  const specialized = detectSpecialized(commissionName);

  if (specialized) {
    if (isReadOnly) {
      switch (specialized) {
        case "noel": return <NoelAmicaliste />;
        case "fdf": return <FdfAmicaliste />;
        case "saintebarbe": return <SainteBarbeAmicaliste />;
        case "solidarite": return <SolidariteAmicaliste />;
        case "foyer": return null;
      }
    } else {
      switch (specialized) {
        case "noel": return <NoelBureau budget={budget} />;
        case "fdf": return <FdfBureau budget={budget} />;
        case "saintebarbe": return <SainteBarbeBureau budget={budget} />;
        case "solidarite": return <SolidariteBureau budget={budget} />;
        case "foyer": return <FoyerBureau budget={budget} />;
      }
    }
  }

  const activeFeatures = features.filter((f) => f in TAB_CONFIG);
  if (activeFeatures.length === 0) return null;

  const defaultTab = activeFeatures[0]!;

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        {activeFeatures.map((f) => (
          <TabsTrigger key={f} value={f}>
            <span className="mr-1.5">{TAB_CONFIG[f]!.icon}</span>
            {TAB_CONFIG[f]!.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {activeFeatures.includes("evenements") && (
        <TabsContent value="evenements">
          <ModuleEvenements commissionId={commissionId} isReadOnly={isReadOnly} />
        </TabsContent>
      )}

      {activeFeatures.includes("voyages") && (
        <TabsContent value="voyages">
          <ModuleVoyages commissionId={commissionId} isReadOnly={isReadOnly} />
        </TabsContent>
      )}

      {activeFeatures.includes("locations") && (
        <TabsContent value="locations">
          <ModuleLocations commissionId={commissionId} isReadOnly={isReadOnly} />
        </TabsContent>
      )}

      {activeFeatures.includes("compta") && (
        <TabsContent value="compta">
          <ModuleCompta
            commissionId={commissionId}
            commissionName={commissionName}
            budget={budget}
            isReadOnly={isReadOnly}
          />
        </TabsContent>
      )}

      {activeFeatures.includes("documents") && (
        <TabsContent value="documents">
          <ModuleDocuments
            commissionId={commissionId}
            isReadOnly={isReadOnly}
          />
        </TabsContent>
      )}

      {activeFeatures.includes("membres") && (
        <TabsContent value="membres">
          <ModuleMembres
            commissionId={commissionId}
            isReadOnly={isReadOnly}
          />
        </TabsContent>
      )}

      {activeFeatures.includes("notifications") && (
        <TabsContent value="notifications">
          <ModuleNotifications
            commissionId={commissionId}
            isReadOnly={isReadOnly}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
