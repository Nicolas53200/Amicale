"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InvitationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [member, setMember] = useState<{
    org_name: string;
    first_name: string;
    last_name: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function lookupInvitation() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("lookup_invitation", {
        p_code: code,
      });

      if (error || !data) {
        setError("Code d'invitation invalide ou expiré");
      } else {
        setMember(data as { org_name: string; first_name: string; last_name: string });
      }
      setLoading(false);
    }
    lookupInvitation();
  }, [code]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const supabase = createClient();

    const { data: signUpData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { invitation_code: code },
      },
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

    const { error: bindError } = await supabase.rpc("bind_user_to_invitation", {
      p_invitation_code: code,
    });

    if (bindError) {
      setError(bindError.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.refreshSession();

    router.push("/onboarding");
    router.refresh();
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-content-muted">
            Vérification du code...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!member) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Invitation invalide</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-content-secondary">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = [member.first_name, member.last_name].filter(Boolean).join(" ");

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 text-center text-3xl font-bold text-brand-500">
          {member.org_name || "Amicale"}
        </div>
        <CardTitle className="text-center">
          {displayName ? `Bienvenue ${displayName}` : "Bienvenue"}
        </CardTitle>
        <p className="text-center text-sm text-content-secondary">
          Créez votre compte pour rejoindre l&apos;amicale
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-content-secondary">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-content-secondary">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Création..." : "Créer mon compte"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
