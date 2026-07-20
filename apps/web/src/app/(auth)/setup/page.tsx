"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SETUP_PASSWORD = "IGNISNOVA";

export default function SetupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/bureau/dashboard");
    });
  }, [router]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setSubmitting(false);
      return;
    }

    const slug = slugify(orgName);
    if (!slug) {
      setError("Nom d'amicale invalide");
      setSubmitting(false);
      return;
    }

    const supabase = createClient();

    const { data: signUpData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setSubmitting(false);
      return;
    }

    if (!signUpData.session) {
      setError("Vérifiez votre email pour confirmer votre inscription.");
      setSubmitting(false);
      return;
    }

    const { error: setupError } = await supabase.rpc("setup_organization", {
      p_org_name: orgName.trim(),
      p_org_slug: slug,
      p_first_name: firstName.trim(),
      p_last_name: lastName.trim(),
      p_email: email.trim(),
    });

    if (setupError) {
      setError(setupError.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.refreshSession();

    router.push("/onboarding");
    router.refresh();
  }

  if (!authorized) {
    return (
      <div className="rounded-[20px] bg-surface-elevated p-6 shadow-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-content-primary">
            Accès administrateur
          </h2>
          <p className="mt-1 text-[12px] text-content-muted">
            Entrez le code d&apos;accès pour créer une nouvelle amicale
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Input
            type="password"
            value={setupCode}
            onChange={(e) => {
              setSetupCode(e.target.value);
              setSetupError("");
            }}
            placeholder="Code d'accès"
            onKeyDown={(e) => {
              if (e.key === "Enter" && setupCode === SETUP_PASSWORD) setAuthorized(true);
              else if (e.key === "Enter") setSetupError("Code incorrect");
            }}
            autoFocus
          />
          {setupError && <p className="text-[12px] text-red-500">{setupError}</p>}
          <Button
            type="button"
            onClick={() => {
              if (setupCode === SETUP_PASSWORD) setAuthorized(true);
              else setSetupError("Code incorrect");
            }}
          >
            Valider
          </Button>
        </div>
        <div className="mt-5 text-center">
          <Link href="/login" className="text-[12px] font-medium text-content-muted hover:text-brand-500 hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-surface-elevated p-6 shadow-sm">
      <div className="mb-5 text-center">
        <h2 className="text-lg font-bold text-content-primary">
          Créer votre amicale
        </h2>
        <p className="mt-1 text-[12px] text-content-muted">
          Configurez votre espace en quelques instants
        </p>
      </div>

      <form onSubmit={handleSetup} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-content-secondary">
            Nom de l&apos;amicale
          </label>
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Amicale SP Laval"
            required
          />
          {orgName && (
            <p className="text-[11px] text-content-muted">
              Identifiant : <span className="font-mono">{slugify(orgName) || "—"}</span>
            </p>
          )}
        </div>

        <div className="my-1 border-t border-border" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-content-secondary">
              Votre prénom
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nicolas"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-content-secondary">
              Votre nom
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Morel"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-content-secondary">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-content-secondary">
            Mot de passe
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-1">
          {submitting ? "Création en cours..." : "Créer mon amicale"}
        </Button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-[12px] text-content-muted">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="mt-1.5 text-[12px] text-content-muted">
          Vous avez un code d&apos;invitation ?{" "}
          <Link href="/login" className="font-medium text-brand-500 hover:underline">
            Rejoindre une amicale
          </Link>
        </p>
      </div>
    </div>
  );
}
