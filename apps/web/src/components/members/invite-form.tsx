"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createMember } from "@/lib/actions/members";

export function InviteForm({ onSuccess }: { onSuccess?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createMember(formData);

    setInvitationCode(result.invitationCode);
    setSubmitting(false);
    onSuccess?.();
  }

  function copyLink() {
    if (!invitationCode) return;
    const url = `${window.location.origin}/invitation/${invitationCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (invitationCode) {
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invitation/${invitationCode}`;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Membre invité</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-500/20">
            ✓
          </div>
          <p className="text-sm text-content-secondary">
            Lien d&apos;invitation :
          </p>
          <div className="flex w-full items-center gap-2 rounded-[12px] bg-surface-secondary px-3 py-2.5">
            <p className="flex-1 truncate text-[13px] font-medium text-content-primary">
              {inviteUrl}
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-[8px] bg-brand-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-600"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <p className="text-[11px] text-content-muted">
            Code : <span className="font-mono font-bold">{invitationCode}</span>
          </p>
          <p className="max-w-xs text-center text-xs text-content-muted">
            Partagez ce lien avec le membre pour qu&apos;il puisse créer son
            compte et rejoindre l&apos;amicale.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setInvitationCode(null);
              setCopied(false);
            }}
          >
            Inviter un autre membre
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter un membre</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Prénom
              </label>
              <Input name="first_name" required placeholder="Jean" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Nom
              </label>
              <Input name="last_name" required placeholder="Dupont" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="jean@email.fr"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Téléphone
              </label>
              <Input name="phone" placeholder="06 12 34 56 78" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Rôle
              </label>
              <Select name="role">
                <option value="membre">Membre</option>
                <option value="commissaire">Commissaire</option>
                <option value="secretaire">Secrétaire</option>
                <option value="tresorier">Trésorier(ère)</option>
                <option value="president">Président(e)</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">
                Grade
              </label>
              <Input name="grade" placeholder="Sapeur, Caporal..." />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">
              Centre
            </label>
            <Input name="centre" placeholder="CIS de..." />
          </div>
          <Button type="submit" disabled={submitting} className="self-end">
            {submitting ? "Création..." : "Créer l'invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
