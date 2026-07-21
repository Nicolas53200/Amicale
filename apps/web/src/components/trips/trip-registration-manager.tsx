"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  validateTripRegistration,
  refuseTripRegistration,
  deleteTripRegistration,
} from "@/lib/actions/trips";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Registration {
  member_id: string;
  nb_adults: number;
  nb_children: number;
  total_amount: number;
  payment_status: string;
  status: string;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface TripRegistrationManagerProps {
  tripId: string;
  registrations: Registration[];
  maxSeats: number | null;
}

export function TripRegistrationManager({
  tripId,
  registrations,
  maxSeats,
}: TripRegistrationManagerProps) {
  const [pending, startTransition] = useTransition();
  const [inscritsSectionOpen, setInscritsSectionOpen] = useState(true);

  const attente = registrations.filter((r) => r.status === "en_attente");
  const acceptees = registrations.filter((r) => r.status === "acceptee");
  const refusees = registrations.filter((r) => r.status === "refusee");

  const totalPersonnes = registrations
    .filter((r) => r.status !== "refusee")
    .reduce((s, r) => s + r.nb_adults + r.nb_children, 0);

  function handleValidate(memberId: string) {
    startTransition(() => validateTripRegistration(tripId, memberId));
  }

  function handleRefuse(memberId: string) {
    startTransition(() => refuseTripRegistration(tripId, memberId));
  }

  function handleDelete(memberId: string) {
    startTransition(() => deleteTripRegistration(tripId, memberId));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[12px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[18px] font-bold text-content-primary">{totalPersonnes}</p>
          <p className="text-[10px] text-content-muted">
            {maxSeats ? `/ ${maxSeats} places` : "inscrits"}
          </p>
        </div>
        <div className="rounded-[12px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[18px] font-bold text-amber-600">{attente.length}</p>
          <p className="text-[10px] text-content-muted">en attente</p>
        </div>
        <div className="rounded-[12px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[18px] font-bold text-emerald-600">{acceptees.length}</p>
          <p className="text-[10px] text-content-muted">confirmes</p>
        </div>
      </div>

      {/* Pending inscriptions */}
      {attente.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-content-primary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              {attente.length}
            </span>
            Inscriptions en attente
          </h3>
          <div className="flex flex-col gap-2">
            {attente.map((r) => (
              <div
                key={r.member_id}
                className="rounded-[12px] border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-500/20 dark:bg-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${r.members.first_name} ${r.members.last_name}`}
                    src={r.members.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {r.members.first_name} {r.members.last_name}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {r.nb_adults} adulte{r.nb_adults > 1 ? "s" : ""}
                      {r.nb_children > 0 &&
                        `, ${r.nb_children} enfant${r.nb_children > 1 ? "s" : ""}`}
                      {" · "}
                      {fmt(r.total_amount)}
                    </p>
                  </div>
                  <Badge variant="warning">En attente</Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleValidate(r.member_id)}
                    className="rounded-[10px] bg-emerald-600 px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleRefuse(r.member_id)}
                    className="rounded-[10px] bg-red-500 px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All inscriptions collapsible */}
      <div className="rounded-[16px] bg-surface-elevated shadow-sm">
        <button
          type="button"
          onClick={() => setInscritsSectionOpen(!inscritsSectionOpen)}
          className="flex w-full items-center justify-between p-4"
        >
          <h3 className="text-[14px] font-bold text-content-primary">
            Tous les inscrits ({registrations.length})
          </h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-content-muted transition-transform duration-200 ${inscritsSectionOpen ? "" : "-rotate-90"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {inscritsSectionOpen && (
          <div className="flex flex-col gap-2 px-4 pb-4">
            {registrations.length === 0 ? (
              <p className="py-2 text-center text-[13px] text-content-muted">
                Aucun inscrit
              </p>
            ) : (
              registrations.map((r) => {
                const statusVariant =
                  r.status === "acceptee"
                    ? "success"
                    : r.status === "refusee"
                    ? "danger"
                    : "warning";
                const statusLabel =
                  r.status === "acceptee"
                    ? "Confirme"
                    : r.status === "refusee"
                    ? "Refuse"
                    : "En attente";
                return (
                  <div
                    key={r.member_id}
                    className={`flex items-center gap-3 rounded-[10px] p-2.5 ${r.status === "refusee" ? "bg-surface-secondary opacity-50" : "bg-surface-secondary"}`}
                  >
                    <Avatar
                      name={`${r.members.first_name} ${r.members.last_name}`}
                      src={r.members.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-content-primary">
                        {r.members.first_name} {r.members.last_name}
                      </p>
                      <p className="text-[11px] text-content-muted">
                        {r.nb_adults} adulte{r.nb_adults > 1 ? "s" : ""}
                        {r.nb_children > 0 &&
                          `, ${r.nb_children} enfant${r.nb_children > 1 ? "s" : ""}`}
                        {" · "}
                        {fmt(r.total_amount)}
                      </p>
                    </div>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                    {r.status !== "refusee" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDelete(r.member_id)}
                        className="text-content-muted hover:text-red-500"
                        title="Supprimer l'inscription"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
