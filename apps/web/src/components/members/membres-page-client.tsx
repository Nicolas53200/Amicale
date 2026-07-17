"use client";

import { useState, useMemo } from "react";
import { MemberCard } from "./member-card";
import { ListFilter } from "@/components/ui/list-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { inviteMember } from "@/lib/actions/members";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email: string | null;
  avatar_url: string | null;
  is_bureau: boolean;
  invitation_code: string | null;
}

const tabs = [
  { label: "Tous", value: "all" },
  { label: "Actifs", value: "actif" },
  { label: "Bureau", value: "bureau" },
  { label: "Invites", value: "invite" },
];

export function MembresPageClient({ members }: { members: Member[] }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const total = members.length;
  const actifs = members.filter((m) => m.status === "actif").length;
  const bureau = members.filter((m) => m.is_bureau).length;
  const invites = members.filter((m) => m.status === "invite").length;

  const filtered = useMemo(() => {
    let result = members;
    if (tab === "actif") result = result.filter((m) => m.status === "actif");
    else if (tab === "bureau") result = result.filter((m) => m.is_bureau);
    else if (tab === "invite")
      result = result.filter((m) => m.status === "invite");

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.first_name.toLowerCase().includes(q) ||
          m.last_name.toLowerCase().includes(q) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          m.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [members, search, tab]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);
    setInviteResult(null);

    try {
      const result = await inviteMember(inviteEmail.trim());
      setInviteResult(result.invitationCode);
      setInviteEmail("");
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">
            Total
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">
            {total}
          </p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">
            Actifs
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600">
            {actifs}
          </p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">
            Bureau
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">
            {bureau}
          </p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">
            Invites
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-500">
            {invites}
          </p>
        </div>
      </div>

      {/* Search / filter */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Liste des membres
        </h3>
        <div className="flex flex-col gap-3">
          <ListFilter
            searchPlaceholder="Rechercher un membre..."
            tabs={tabs}
            activeTab={tab}
            onSearchChange={setSearch}
            onTabChange={setTab}
          />
          {filtered.length === 0 ? (
            <EmptyState
              icon="👥"
              title="Aucun resultat"
              description={
                search
                  ? "Essayez un autre terme de recherche"
                  : "Aucun membre dans cette categorie"
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-content-muted">
                {filtered.length} membre{filtered.length > 1 ? "s" : ""}
              </p>
              {filtered.map((m) => (
                <div key={m.id} className="animate-fade-in">
                  <MemberCard
                    id={m.id}
                    firstName={m.first_name}
                    lastName={m.last_name}
                    role={m.role}
                    status={m.status}
                    email={m.email}
                    avatarUrl={m.avatar_url}
                    isBureau={m.is_bureau}
                    invitationCode={m.invitation_code}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite card */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="text-[14px] font-bold text-content-primary">
          Inviter par email
        </h3>
        <p className="mt-1 text-[12px] text-content-muted">
          Envoyez une invitation rapide par email pour rejoindre l&apos;amicale.
        </p>
        <form onSubmit={handleInvite} className="mt-3 flex gap-2">
          <Input
            type="email"
            placeholder="adresse@email.fr"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="flex-1"
          />
          <button
            type="submit"
            disabled={inviting}
            className="btn-gradient shrink-0 rounded-[14px] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {inviting ? "Envoi..." : "Inviter"}
          </button>
        </form>

        {inviteResult && (
          <div className="mt-3 rounded-[12px] bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
              Invitation creee
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="flex-1 truncate text-[12px] font-medium text-emerald-800 dark:text-emerald-300">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/invitation/${inviteResult}`
                  : `/invitation/${inviteResult}`}
              </p>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/invitation/${inviteResult}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 rounded-[8px] bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-500">
              Partagez ce lien avec le membre.
            </p>
          </div>
        )}

        {inviteError && (
          <div className="mt-3 rounded-[12px] bg-red-50 p-3 dark:bg-red-500/10">
            <p className="text-[12px] font-semibold text-red-700 dark:text-red-400">
              {inviteError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
