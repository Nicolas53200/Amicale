"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  memberId: string;
  firstName: string;
  lastName: string;
  orgName: string;
}

const steps = [
  { title: "Bienvenue", icon: "👋" },
  { title: "Vos informations", icon: "📋" },
  { title: "Votre centre", icon: "🚒" },
  { title: "Prêt !", icon: "🎉" },
];

export function OnboardingWizard({ memberId, firstName, lastName, orgName }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [grade, setGrade] = useState("");
  const [centre, setCentre] = useState("");
  const [saving, setSaving] = useState(false);

  async function finishOnboarding() {
    setSaving(true);
    const supabase = createClient();

    const updates: Record<string, string | boolean> = {
      onboarding_completed: true,
      status: "actif",
    };
    if (phone) updates.phone = phone;
    if (adresse) updates.adresse = adresse;
    if (dateNaissance) updates.date_naissance = dateNaissance;
    if (grade) updates.grade = grade;
    if (centre) updates.centre = centre;

    await supabase.from("members").update(updates).eq("id", memberId);

    router.push("/amicaliste/accueil");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === step ? "w-8 bg-brand-500" : i < step ? "w-6 bg-brand-300" : "w-6 bg-border"
              )}
            />
          ))}
        </div>

        <Card>
          <CardContent className="py-8">
            {step === 0 && (
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">{steps[0]!.icon}</span>
                <h1 className="text-2xl font-bold text-content-primary">
                  Bienvenue {firstName} !
                </h1>
                <p className="text-sm text-content-secondary">
                  Vous avez rejoint l&apos;amicale <strong>{orgName}</strong>.
                  Prenons quelques instants pour configurer votre profil.
                </p>
                <Button className="mt-4" onClick={() => setStep(1)}>
                  Commencer
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <span className="text-3xl">{steps[1]!.icon}</span>
                  <h2 className="mt-2 text-lg font-bold text-content-primary">
                    Vos informations
                  </h2>
                  <p className="text-sm text-content-muted">Facultatif, modifiable plus tard</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-secondary">Téléphone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 00 00 00 00"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-secondary">Adresse</label>
                  <Input
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder="Votre adresse"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-secondary">Date de naissance</label>
                  <Input
                    type="date"
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                  />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(0)}>Retour</Button>
                  <Button onClick={() => setStep(2)}>Suivant</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <span className="text-3xl">{steps[2]!.icon}</span>
                  <h2 className="mt-2 text-lg font-bold text-content-primary">
                    Votre centre
                  </h2>
                  <p className="text-sm text-content-muted">Facultatif</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-secondary">Grade</label>
                  <Input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Caporal, Sergent, Adjudant..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-secondary">Centre de secours</label>
                  <Input
                    value={centre}
                    onChange={(e) => setCentre(e.target.value)}
                    placeholder="CIS de..."
                  />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)}>Retour</Button>
                  <Button onClick={() => setStep(3)}>Suivant</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">{steps[3]!.icon}</span>
                <h2 className="text-2xl font-bold text-content-primary">
                  Tout est prêt !
                </h2>
                <p className="text-sm text-content-secondary">
                  Votre profil est configuré. Vous pouvez découvrir les événements,
                  voyages et locations de votre amicale.
                </p>
                <Button className="mt-4" onClick={finishOnboarding} disabled={saving}>
                  {saving ? "Finalisation..." : "Accéder à l'amicale"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
