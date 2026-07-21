"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  validateRegistration,
  refuseRegistration,
  deleteRegistration,
  validateBenevole,
  refuseBenevole,
} from "@/lib/actions/events";

interface Registration {
  member_id: string;
  nb_personnes: number;
  nb_adultes?: number;
  nb_enfants?: number;
  status: string;
  is_benevole: string | null;
  benevole_poste: string | null;
  benevole_status: string | null;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface Props {
  eventId: string;
  registrations: Registration[];
  maxAttendees: number | null;
  maxBenevoles: number | null;
  price: number;
}

const BENEVOLE_ROLES_ORDER = [
  "Accueil",
  "Service table",
  "Buvette",
  "Cuisine",
  "Securite",
  "Logistique",
  "Arbitrage",
  "Animation",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

function CollapsibleSection({
  title,
  count,
  max,
  icon,
  variant,
  defaultOpen = true,
  children,
}: {
  title: string;
  count: number;
  max?: number | null;
  icon: string;
  variant: "blue" | "amber" | "green" | "red";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const colors = {
    blue: "bg-blue-100 dark:bg-blue-500/20",
    amber: "bg-amber-100 dark:bg-amber-500/20",
    green: "bg-green-100 dark:bg-green-500/20",
    red: "bg-red-100 dark:bg-red-500/20",
  };

  return (
    <div className="rounded-[16px] bg-surface-elevated shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colors[variant]}`}
        >
          <span className="text-sm">{icon}</span>
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-[14px] font-bold text-content-primary">
            {title} ({count}
            {max ? ` / ${max}` : ""})
          </h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-content-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="border-t border-border px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

function ActionButton({
  onClick,
  variant,
  disabled,
  children,
}: {
  onClick: () => void;
  variant: "success" | "danger" | "neutral";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const cls = {
    success:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400",
    danger:
      "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400",
    neutral:
      "bg-surface-secondary text-content-secondary hover:bg-surface-primary",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[8px] px-2 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50 ${cls[variant]}`}
    >
      {children}
    </button>
  );
}

export function EventRegistrationManager({
  eventId,
  registrations,
  maxAttendees,
  maxBenevoles,
  price,
}: Props) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const inscrits = registrations.filter((r) => !r.is_benevole);
  const benevoles = registrations.filter((r) => r.is_benevole);
  const benevolesValides = benevoles.filter(
    (r) => r.benevole_status === "valide"
  );
  const benevolesAttente = benevoles.filter(
    (r) => r.benevole_status === "attente"
  );
  const benevolesRefuses = benevoles.filter(
    (r) => r.benevole_status === "refuse"
  );

  const totalPersonnes = registrations.reduce(
    (s, r) => s + (r.nb_personnes || 1),
    0
  );

  const byRole = new Map<string, Registration[]>();
  for (const b of benevoles) {
    const role = b.benevole_poste || b.is_benevole || "Autre";
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role)!.push(b);
  }

  const sortedRoles = [...byRole.keys()].sort((a, b) => {
    const ia = BENEVOLE_ROLES_ORDER.indexOf(a);
    const ib = BENEVOLE_ROLES_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  function handleValidateReg(memberId: string) {
    startTransition(async () => {
      try {
        await validateRegistration(eventId, memberId);
        showToast("Inscription validee", "success");
      } catch {
        showToast("Erreur", "error");
      }
    });
  }

  function handleRefuseReg(memberId: string) {
    startTransition(async () => {
      try {
        await refuseRegistration(eventId, memberId);
        showToast("Inscription refusee", "success");
      } catch {
        showToast("Erreur", "error");
      }
    });
  }

  function handleDeleteReg(memberId: string) {
    if (!confirm("Supprimer cette inscription ?")) return;
    startTransition(async () => {
      try {
        await deleteRegistration(eventId, memberId);
        showToast("Inscription supprimee", "success");
      } catch {
        showToast("Erreur", "error");
      }
    });
  }

  function handleValidateBen(memberId: string) {
    startTransition(async () => {
      try {
        await validateBenevole(eventId, memberId);
        showToast("Benevole valide", "success");
      } catch {
        showToast("Erreur", "error");
      }
    });
  }

  function handleRefuseBen(memberId: string) {
    startTransition(async () => {
      try {
        await refuseBenevole(eventId, memberId);
        showToast("Candidature refusee", "success");
      } catch {
        showToast("Erreur", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Compteurs dynamiques */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[12px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[20px] font-bold tabular-nums text-blue-600">
            {totalPersonnes}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-content-muted">
            Personnes
          </p>
        </div>
        <div className="rounded-[12px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[20px] font-bold tabular-nums text-amber-600">
            {benevolesValides.length}
            {maxBenevoles ? `/${maxBenevoles}` : ""}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-content-muted">
            Benevoles
          </p>
        </div>
        <div className="rounded-[12px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[20px] font-bold tabular-nums text-content-primary">
            {maxAttendees
              ? Math.max(0, maxAttendees - totalPersonnes)
              : "∞"}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-content-muted">
            Places restantes
          </p>
        </div>
      </div>

      {price > 0 && (
        <div className="rounded-[12px] bg-surface-elevated p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-content-secondary">
              Recettes inscriptions
            </span>
            <span className="text-[15px] font-bold text-emerald-600">
              {fmt(
                price *
                  registrations.reduce(
                    (s, r) => s + (r.nb_personnes || 1),
                    0
                  )
              )}
            </span>
          </div>
        </div>
      )}

      {/* Section inscrits */}
      <CollapsibleSection
        title="Inscrits"
        count={inscrits.length}
        max={maxAttendees}
        icon="👥"
        variant="blue"
      >
        {inscrits.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">
            Aucun inscrit
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {inscrits.map((r) => (
              <div
                key={r.member_id}
                className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5"
              >
                <Avatar
                  name={`${r.members.first_name} ${r.members.last_name}`}
                  src={r.members.avatar_url}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-content-primary">
                    {r.members.first_name} {r.members.last_name}
                  </p>
                  <p className="text-[11px] text-content-muted">
                    {r.nb_personnes || 1} pers.
                    {r.nb_adultes
                      ? ` (${r.nb_adultes}A${r.nb_enfants ? `+${r.nb_enfants}E` : ""})`
                      : ""}
                    {price > 0 && ` · ${fmt(price * (r.nb_personnes || 1))}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={
                      r.status === "valide"
                        ? "success"
                        : r.status === "refuse"
                          ? "danger"
                          : r.status === "inscrit"
                            ? "warning"
                            : "neutral"
                    }
                  >
                    {r.status === "inscrit"
                      ? "En attente"
                      : r.status === "valide"
                        ? "Valide"
                        : r.status === "refuse"
                          ? "Refuse"
                          : r.status}
                  </Badge>
                  {r.status === "inscrit" && (
                    <>
                      <ActionButton
                        onClick={() => handleValidateReg(r.member_id)}
                        variant="success"
                        disabled={pending}
                      >
                        ✓
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleRefuseReg(r.member_id)}
                        variant="danger"
                        disabled={pending}
                      >
                        ✗
                      </ActionButton>
                    </>
                  )}
                  <ActionButton
                    onClick={() => handleDeleteReg(r.member_id)}
                    variant="neutral"
                    disabled={pending}
                  >
                    🗑
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Section benevoles valides - par role */}
      <CollapsibleSection
        title="Benevoles"
        count={benevolesValides.length}
        max={maxBenevoles}
        icon="🤝"
        variant="green"
      >
        {benevoles.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">
            Aucun benevole
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Compteurs par role */}
            {sortedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sortedRoles.map((role) => {
                  const roleRegs = byRole.get(role)!;
                  const validated = roleRegs.filter(
                    (r) => r.benevole_status === "valide"
                  ).length;
                  return (
                    <span
                      key={role}
                      className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-medium text-content-secondary"
                    >
                      {role}: {validated}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Benevoles valides */}
            {benevolesValides.length > 0 && (
              <div className="flex flex-col gap-2">
                {benevolesValides.map((r) => (
                  <div
                    key={r.member_id}
                    className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5"
                  >
                    <Avatar
                      name={`${r.members.first_name} ${r.members.last_name}`}
                      src={r.members.avatar_url}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-content-primary">
                        {r.members.first_name} {r.members.last_name}
                      </p>
                    </div>
                    <Badge variant="success">
                      {r.benevole_poste || r.is_benevole}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Candidatures en attente */}
            {benevolesAttente.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[13px]">🕐</span>
                  <h4 className="text-[13px] font-bold text-amber-600">
                    Candidatures en attente ({benevolesAttente.length})
                  </h4>
                </div>
                <div className="flex flex-col gap-2">
                  {benevolesAttente.map((r) => (
                    <div
                      key={r.member_id}
                      className="flex items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-500/20 dark:bg-amber-500/5"
                    >
                      <Avatar
                        name={`${r.members.first_name} ${r.members.last_name}`}
                        src={r.members.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-content-primary">
                          {r.members.first_name} {r.members.last_name}
                        </p>
                        <p className="text-[11px] text-amber-600">
                          Poste : {r.benevole_poste || r.is_benevole}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <ActionButton
                          onClick={() => handleValidateBen(r.member_id)}
                          variant="success"
                          disabled={pending}
                        >
                          Valider
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleRefuseBen(r.member_id)}
                          variant="danger"
                          disabled={pending}
                        >
                          Refuser
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benevoles refuses */}
            {benevolesRefuses.length > 0 && (
              <div>
                <h4 className="mb-2 text-[12px] font-medium text-content-muted">
                  Refuses ({benevolesRefuses.length})
                </h4>
                <div className="flex flex-col gap-1.5">
                  {benevolesRefuses.map((r) => (
                    <div
                      key={r.member_id}
                      className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2 opacity-60"
                    >
                      <Avatar
                        name={`${r.members.first_name} ${r.members.last_name}`}
                        src={r.members.avatar_url}
                        size="sm"
                      />
                      <span className="flex-1 text-[12px] text-content-muted">
                        {r.members.first_name} {r.members.last_name}
                      </span>
                      <Badge variant="danger">Refuse</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Postes libres */}
            {maxBenevoles && benevolesValides.length < maxBenevoles && (
              <div className="rounded-[10px] bg-amber-50 p-2.5 text-center text-[12px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                + {maxBenevoles - benevolesValides.length} poste
                {maxBenevoles - benevolesValides.length > 1 ? "s" : ""} libre
                {maxBenevoles - benevolesValides.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
