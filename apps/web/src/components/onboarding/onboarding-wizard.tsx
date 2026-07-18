"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  memberId: string;
  firstName: string;
  lastName: string;
  orgName: string;
}

const steps = [
  { number: 1, title: "Bienvenue" },
  { number: 2, title: "Infos" },
  { number: 3, title: "Famille" },
  { number: 4, title: "Avatar" },
  { number: 5, title: "Valider" },
];

const avatarEmojis = [
  "\u{1F692}", "\u{1F9D1}‍\u{1F692}", "\u{1F525}", "⛑️", "\u{1F9BA}", "\u{1F4AA}", "\u{1F3CB}️", "⚡",
  "\u{1F415}", "\u{1F431}", "\u{1F3D4}️", "\u{1F30A}", "\u{1F3B8}", "⚽", "\u{1F3AF}", "\u{1F340}",
];

export function OnboardingWizard({ memberId, firstName: initialFirstName, lastName: initialLastName, orgName }: OnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [grade, setGrade] = useState("");
  const [centre, setCentre] = useState("");
  const [situationFamiliale, setSituationFamiliale] = useState("");
  const [nbEnfants, setNbEnfants] = useState("0");
  const [contactUrgence, setContactUrgence] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("\u{1F692}");
  const [saving, setSaving] = useState(false);

  const namesEditable = !initialFirstName || !initialLastName;

  async function finishOnboarding() {
    setSaving(true);
    const supabase = createClient();

    const updates: Record<string, unknown> = {
      onboarding_completed: true,
      status: "actif",
      avatar_url: selectedEmoji,
    };
    if (namesEditable) {
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
    }
    if (phone) updates.phone = phone;
    if (adresse) updates.adresse = adresse;
    if (dateNaissance) updates.date_naissance = dateNaissance;
    if (grade) updates.grade = grade;
    if (centre) updates.centre = centre;
    if (situationFamiliale) updates.situation_familiale = situationFamiliale;
    updates.nb_enfants = Number(nbEnfants);
    if (contactUrgence) updates.contact_urgence = contactUrgence;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("members").update(updates).eq("id", memberId).eq("user_id", user.id);
    await supabase.auth.refreshSession();

    router.push("/amicaliste/accueil");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold transition-all",
                    i === step
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                      : i < step
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400"
                        : "bg-surface-elevated text-content-muted border border-border"
                  )}
                >
                  {i < step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-[10px] font-medium",
                    i === step ? "text-brand-500" : "text-content-muted"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-5 h-[2px] w-12 rounded-full transition-colors",
                    i < step ? "bg-brand-400" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Welcome + name/phone */}
        {step === 0 && (
          <div className="rounded-[16px] bg-surface-elevated p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <h1 className="text-[22px] font-bold text-content-primary">
                Bienvenue {firstName || ""} !
              </h1>
              <p className="text-[13px] text-content-secondary">
                Vous avez rejoint l&apos;amicale <strong>{orgName}</strong>.
                Prenons quelques instants pour configurer votre profil.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prenom</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!namesEditable}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Nom</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!namesEditable}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Telephone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(1)}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Professional info */}
        {step === 1 && (
          <div className="rounded-[16px] bg-surface-elevated p-6 shadow-sm">
            <div className="mb-4 text-center">
              <h2 className="text-[18px] font-bold text-content-primary">
                Coordonnees & grade
              </h2>
              <p className="mt-1 text-[12px] text-content-muted">Facultatif, modifiable plus tard</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Grade</label>
                  <Input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Caporal, Sergent..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Centre de secours</label>
                  <Input
                    value={centre}
                    onChange={(e) => setCentre(e.target.value)}
                    placeholder="CIS de..."
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de naissance</label>
                <Input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Adresse</label>
                <Input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Votre adresse"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>Retour</Button>
              <Button onClick={() => setStep(2)}>Suivant</Button>
            </div>
          </div>
        )}

        {/* Step 3: Famille */}
        {step === 2 && (
          <div className="rounded-[16px] bg-surface-elevated p-6 shadow-sm">
            <div className="mb-4 text-center">
              <h2 className="text-[18px] font-bold text-content-primary">
                Vie familiale
              </h2>
              <p className="mt-1 text-[12px] text-content-muted">
                Aide a organiser les voyages et evenements familiaux
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Situation familiale
                </label>
                <select
                  value={situationFamiliale}
                  onChange={(e) => setSituationFamiliale(e.target.value)}
                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                >
                  <option value="">Non precise</option>
                  <option value="celibataire">Celibataire</option>
                  <option value="en_couple">En couple</option>
                  <option value="marie">Marie(e)</option>
                  <option value="pacse">Pacse(e)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Nombre d&apos;enfants
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNbEnfants(String(Math.max(0, Number(nbEnfants) - 1)))}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-lg font-bold text-content-primary"
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center text-[18px] font-bold tabular-nums text-content-primary">
                    {nbEnfants}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNbEnfants(String(Math.min(10, Number(nbEnfants) + 1)))}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Contact d&apos;urgence
                </label>
                <Input
                  value={contactUrgence}
                  onChange={(e) => setContactUrgence(e.target.value)}
                  placeholder="Nom et telephone"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Retour</Button>
              <Button onClick={() => setStep(3)}>Suivant</Button>
            </div>
          </div>
        )}

        {/* Step 4: Avatar / Emoji */}
        {step === 3 && (
          <div className="rounded-[16px] bg-surface-elevated p-6 shadow-sm">
            <div className="mb-4 text-center">
              <h2 className="text-[18px] font-bold text-content-primary">
                Votre avatar
              </h2>
              <p className="mt-1 text-[12px] text-content-muted">
                Choisissez un emoji qui vous represente
              </p>
            </div>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
              <span className="text-4xl">{selectedEmoji}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    "flex h-14 items-center justify-center rounded-[12px] text-2xl transition-all",
                    selectedEmoji === emoji
                      ? "bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-500/20"
                      : "bg-surface-secondary hover:bg-surface-primary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Retour</Button>
              <Button onClick={() => setStep(4)}>Suivant</Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation / Summary */}
        {step === 4 && (
          <div className="rounded-[16px] bg-surface-elevated p-6 shadow-sm">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-[18px] font-bold text-content-primary">
                Recapitulatif
              </h2>
              <p className="mt-1 text-[12px] text-content-muted">
                Verifiez vos informations avant de commencer
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <SummaryRow label="Avatar" value={selectedEmoji} />
              <SummaryRow label="Prenom" value={firstName} />
              <SummaryRow label="Nom" value={lastName} />
              <SummaryRow label="Telephone" value={phone} />
              <SummaryRow label="Grade" value={grade} />
              <SummaryRow label="Centre" value={centre} />
              <SummaryRow label="Date de naissance" value={dateNaissance ? formatDate(dateNaissance) : ""} />
              <SummaryRow label="Adresse" value={adresse} />
              {situationFamiliale && <SummaryRow label="Situation" value={situationFamiliale} />}
              {Number(nbEnfants) > 0 && <SummaryRow label="Enfants" value={nbEnfants} />}
              {contactUrgence && <SummaryRow label="Urgence" value={contactUrgence} />}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>Retour</Button>
              <Button onClick={finishOnboarding} disabled={saving}>
                {saving ? "Finalisation..." : "Commencer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[12px] bg-surface-secondary px-3 py-2.5">
      <span className="text-[12px] font-medium text-content-muted">{label}</span>
      <span className="text-[13px] font-medium text-content-primary">
        {value || <span className="text-content-muted italic">Non renseigne</span>}
      </span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}
