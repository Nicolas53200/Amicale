"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      <div className="mt-6 text-center">
        <Link
          href="/invitation"
          className="text-[13px] font-medium text-brand-500 hover:underline"
        >
          Rejoindre avec un code d&apos;invitation
        </Link>
      </div>
    </div>
  );
}
