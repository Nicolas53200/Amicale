"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleCompta } from "./module-compta";
import { ModuleDocuments } from "./module-documents";
import { ModuleMembres } from "./module-membres";
import { ModuleNotifications } from "./module-notifications";
import { ModuleEvenements } from "./module-evenements";
import { ModuleVoyages } from "./module-voyages";
import { ModuleLocations } from "./module-locations";

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

export function ModuleTabs({
  commissionId,
  commissionName,
  features,
  budget,
  isReadOnly = false,
}: ModuleTabsProps) {
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
