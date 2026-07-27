"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-[20px] bg-surface-elevated p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-content-primary">
            Email envoyé
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-content-secondary">
            Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
            vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <p className="mt-3 text-[12px] text-content-muted">
            Pensez à vérifier vos spams.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-[13px] font-medium text-brand-500 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

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
          Mot de passe oublié
        </h2>
        <p className="mt-1 text-[12px] text-content-muted">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-1">
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
        </Button>
      </form>
      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="text-[13px] font-medium text-content-muted hover:text-brand-500 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
