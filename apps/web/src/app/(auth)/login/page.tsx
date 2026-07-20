"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SETUP_PASSWORD = "IGNISNOVA";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupError, setSetupError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: member } = await supabase
        .from("members")
        .select("onboarding_completed, is_bureau")
        .eq("user_id", user.id)
        .single();

      if (member && !member.onboarding_completed) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      if (member?.is_bureau) {
        router.push("/bureau/dashboard");
      } else {
        router.push("/amicaliste/accueil");
      }
    } else {
      router.push("/bureau/dashboard");
    }

    router.refresh();
  }

  function handleSetupSubmit() {
    if (setupCode === SETUP_PASSWORD) {
      router.push("/setup");
    } else {
      setSetupError("Code incorrect");
    }
  }

  return (
    <div className="rounded-[20px] bg-surface-elevated p-6 shadow-sm">
      <h2 className="mb-5 text-center text-lg font-bold text-content-primary">
        Connexion
      </h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-medium text-content-secondary"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[13px] font-medium text-content-secondary"
          >
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-1">
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <Link
          href="/invitation"
          className="text-[13px] font-medium text-brand-500 hover:underline"
        >
          Rejoindre avec un code d&apos;invitation
        </Link>

        <div className="w-full border-t border-border pt-3">
          {!showSetupPrompt ? (
            <button
              type="button"
              onClick={() => setShowSetupPrompt(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-content-muted hover:text-brand-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Créer une nouvelle amicale
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-content-muted">
                Entrez le code d&apos;accès administrateur
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={setupCode}
                  onChange={(e) => {
                    setSetupCode(e.target.value);
                    setSetupError("");
                  }}
                  placeholder="Code d'accès"
                  onKeyDown={(e) => e.key === "Enter" && handleSetupSubmit()}
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleSetupSubmit}
                  className="shrink-0 px-4"
                >
                  OK
                </Button>
              </div>
              {setupError && (
                <p className="text-[12px] text-red-500">{setupError}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowSetupPrompt(false);
                  setSetupCode("");
                  setSetupError("");
                }}
                className="text-[12px] text-content-muted hover:underline"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
