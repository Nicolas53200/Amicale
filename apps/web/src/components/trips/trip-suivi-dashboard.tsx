"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { exportToPdf } from "@/lib/export-pdf";

interface Registration {
  id: string;
  member_id: string;
  nb_adults: number;
  nb_children: number;
  total_amount: number;
  payment_status: string;
  members: { first_name: string; last_name: string; avatar_url: string | null } | null;
}

interface TripMessage {
  id: string;
  body: string;
  is_broadcast: boolean;
  created_at: string;
  sender: { first_name: string; last_name: string } | null;
}

interface Accompagnateur {
  id: string;
  member_id: string;
  status: string;
  created_at: string;
  members: { first_name: string; last_name: string } | null;
}

interface TripSuiviDashboardProps {
  tripId: string;
  tripName: string;
  maxSeats: number | null;
  registrations: Registration[];
  registrationDeadline?: string;
  guidesNeeded?: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

type TabId = "overview" | "communication";

export function TripSuiviDashboard({
  tripId,
  tripName,
  maxSeats,
  registrations,
  registrationDeadline,
  guidesNeeded,
}: TripSuiviDashboardProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const [messages, setMessages] = useState<TripMessage[]>([]);
  const [accompagnateurs, setAccompagnateurs] = useState<Accompagnateur[]>([]);
  const [sending, setSending] = useState(false);
  const [sendingConfirmations, setSendingConfirmations] = useState(false);
  const [msgBody, setMsgBody] = useState("");
  const { showToast } = useToast();

  const loadAccompagnateurs = useCallback(async () => {
    if (!guidesNeeded) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("trip_accompagnateurs")
      .select("id, member_id, status, created_at, members:member_id(first_name, last_name)")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });
    if (data) setAccompagnateurs(data as unknown as Accompagnateur[]);
  }, [tripId, guidesNeeded]);

  useEffect(() => {
    loadAccompagnateurs();
  }, [loadAccompagnateurs]);

  const confirmes = registrations.filter((r) => r.payment_status === "acceptee");
  const enAttente = registrations.filter((r) => r.payment_status === "en_attente");
  const totalPersonnes = registrations.reduce((s, r) => s + r.nb_adults + r.nb_children, 0);
  const confirmesPersonnes = confirmes.reduce((s, r) => s + r.nb_adults + r.nb_children, 0);
  const placesRestantes = maxSeats ? maxSeats - totalPersonnes : null;
  const totalRevenu = confirmes.reduce((s, r) => s + parseFloat(String(r.total_amount)), 0);

  // Status banner logic
  const deadlinePassed = registrationDeadline
    ? new Date(registrationDeadline) < new Date()
    : false;

  let bannerLabel: string;
  let bannerColor: string;
  if (deadlinePassed) {
    bannerLabel = "Inscriptions cloturees";
    bannerColor = "bg-gray-500";
  } else if (placesRestantes !== null && placesRestantes <= 0) {
    bannerLabel = "Complet";
    bannerColor = "bg-red-500";
  } else if (
    placesRestantes !== null &&
    maxSeats &&
    placesRestantes <= maxSeats * 0.2
  ) {
    bannerLabel = `Plus que ${placesRestantes} place${placesRestantes > 1 ? "s" : ""} !`;
    bannerColor = "bg-amber-500";
  } else if (placesRestantes !== null) {
    bannerLabel = `Inscriptions ouvertes - ${placesRestantes} place${placesRestantes > 1 ? "s" : ""} restante${placesRestantes > 1 ? "s" : ""}`;
    bannerColor = "bg-green-500";
  } else {
    bannerLabel = "Inscriptions ouvertes";
    bannerColor = "bg-green-500";
  }

  const loadMessages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("trip_messages")
      .select("id, body, is_broadcast, created_at, sender:from_id(first_name, last_name)")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setMessages(data as unknown as TripMessage[]);
  }, [tripId]);

  useEffect(() => {
    if (tab === "communication") loadMessages();
  }, [tab, loadMessages]);

  async function sendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!msgBody.trim()) return;
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!member) return;

      await supabase.from("trip_messages").insert({
        trip_id: tripId,
        from_id: member.id,
        body: msgBody.trim(),
        is_broadcast: true,
      });

      const orgId = await getOrgIdClient();
      const memberIds = registrations.map((r) => r.member_id);
      if (memberIds.length > 0) {
        const inserts = memberIds.map((mid) => ({
          org_id: orgId,
          from_id: member.id,
          to_id: mid,
          subject: `[INFO] ${tripName} — Communication`,
          body: msgBody.trim(),
        }));
        await supabase.from("messages").insert(inserts);
      }

      setMsgBody("");
      loadMessages();
    } finally {
      setSending(false);
    }
  }

  async function sendConfirmations() {
    if (confirmes.length === 0) return;
    setSendingConfirmations(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!member) return;

      const orgId = await getOrgIdClient();
      const inserts = confirmes.map((r) => {
        const childrenPart =
          r.nb_children > 0 ? `, ${r.nb_children} enfant(s)` : "";
        return {
          org_id: orgId,
          from_id: member.id,
          to_id: r.member_id,
          subject: `[INFO] ${tripName} — Confirmation`,
          body: `Votre inscription au voyage ${tripName} est confirmee. Nous avons bien note votre participation (${r.nb_adults} adulte(s)${childrenPart}). Montant total : ${parseFloat(String(r.total_amount))}€.`,
        };
      });
      await supabase.from("messages").insert(inserts);
      showToast("Confirmations envoyees !", "success");
    } finally {
      setSendingConfirmations(false);
    }
  }

  function handleExport() {
    const paymentLabel = (s: string) => {
      if (s === "acceptee") return '<span class="badge badge-green">Payé</span>';
      if (s === "en_attente") return '<span class="badge badge-amber">En attente</span>';
      return '<span class="badge badge-gray">' + s + '</span>';
    };
    const rows = registrations.map((r) => {
      const name = r.members ? `${r.members.first_name} ${r.members.last_name}` : "Membre";
      const amount = fmt(parseFloat(String(r.total_amount)));
      return `<tr><td>${name}</td><td>${r.nb_adults}</td><td>${r.nb_children}</td><td>${amount}</td><td>${paymentLabel(r.payment_status)}</td></tr>`;
    }).join("");
    const html = `<h1>${tripName} — Suivi</h1>
      <p class="meta">Exporte le ${new Date().toLocaleDateString("fr-FR")}</p>
      <h2>Resume</h2>
      <table><tbody>
        <tr><td><strong>Confirmes</strong></td><td>${confirmes.length} (${confirmesPersonnes} pers.)</td></tr>
        <tr><td><strong>En attente</strong></td><td>${enAttente.length}</td></tr>
        <tr><td><strong>Total personnes</strong></td><td>${totalPersonnes}${maxSeats ? " / " + maxSeats + " places" : ""}</td></tr>
        <tr><td><strong>Revenu confirme</strong></td><td>${fmt(totalRevenu)}</td></tr>
      </tbody></table>
      <h2>Inscriptions</h2>
      <table><thead><tr><th>Membre</th><th>Adultes</th><th>Enfants</th><th>Montant</th><th>Paiement</th></tr></thead><tbody>${rows}</tbody></table>`;
    exportToPdf(`Suivi ${tripName}`, html);
  }

  return (
    <div className="rounded-[16px] bg-surface-elevated shadow-sm overflow-hidden">
      {/* Status banner */}
      <div
        className={cn(
          "px-4 py-2.5 text-center text-[13px] font-semibold text-white",
          bannerColor
        )}
      >
        {bannerLabel}
      </div>

      <div className="flex border-b border-border">
        {(["overview", "communication"] as TabId[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-4 py-3 text-[12px] font-semibold transition-colors",
              tab === t
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-content-muted hover:text-content-secondary"
            )}
          >
            {t === "overview" ? "📊 Suivi" : "📨 Communication"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "overview" ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-[10px] bg-surface-secondary px-3 py-1.5 text-[11px] font-semibold text-content-secondary transition-colors hover:bg-surface-tertiary"
              >
                🖨️ Exporter
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CounterCard
                label="Confirmés"
                value={confirmes.length}
                sub={`${confirmesPersonnes} pers.`}
                color="text-green-600 dark:text-green-400"
              />
              <CounterCard
                label="En attente"
                value={enAttente.length}
                sub={`${enAttente.reduce((s, r) => s + r.nb_adults + r.nb_children, 0)} pers.`}
                color="text-amber-600 dark:text-amber-400"
              />
              <CounterCard
                label="Total personnes"
                value={totalPersonnes}
                sub={maxSeats ? `/ ${maxSeats} places` : ""}
                color="text-content-primary"
              />
              {placesRestantes !== null ? (
                <CounterCard
                  label="Places restantes"
                  value={placesRestantes}
                  sub=""
                  color={placesRestantes <= 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}
                />
              ) : (
                <CounterCard
                  label="Revenu confirmé"
                  value=""
                  sub={fmt(totalRevenu)}
                  color="text-emerald-600 dark:text-emerald-400"
                />
              )}
            </div>

            {maxSeats && (
              <div>
                <div className="mb-1 flex justify-between text-[11px] text-content-muted">
                  <span>Remplissage</span>
                  <span>{Math.min(100, Math.round((totalPersonnes / maxSeats) * 100))}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      totalPersonnes >= maxSeats ? "bg-red-500" : totalPersonnes >= maxSeats * 0.8 ? "bg-amber-500" : "bg-green-500"
                    )}
                    style={{ width: `${Math.min(100, (totalPersonnes / maxSeats) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {confirmes.length > 0 && (
              <div>
                <h4 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">
                  Inscrits confirmés
                </h4>
                <div className="flex flex-col gap-1.5">
                  {confirmes.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-[10px] bg-surface-secondary px-3 py-2">
                      <span className="text-[13px] text-content-primary">
                        {r.members ? `${r.members.first_name} ${r.members.last_name}` : "Membre"}
                      </span>
                      <span className="text-[11px] text-content-muted">
                        {r.nb_adults}A{r.nb_children > 0 ? ` + ${r.nb_children}E` : ""} · {fmt(parseFloat(String(r.total_amount)))}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={sendConfirmations}
                  disabled={sendingConfirmations}
                  className="mt-3 w-full rounded-[12px] bg-green-600 px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {sendingConfirmations
                    ? "Envoi en cours..."
                    : `Envoyer les confirmations (${confirmes.length})`}
                </button>
              </div>
            )}

            {guidesNeeded != null && guidesNeeded > 0 && (
              <div>
                <h4 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">
                  {"🧑‍🏫"} Accompagnateurs ({accompagnateurs.length}/{guidesNeeded})
                </h4>
                {accompagnateurs.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {accompagnateurs.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-[10px] bg-surface-secondary px-3 py-2"
                      >
                        <span className="text-[13px] text-content-primary">
                          {a.members
                            ? `${a.members.first_name} ${a.members.last_name}`
                            : "Membre"}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            a.status === "confirme"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          )}
                        >
                          {a.status === "confirme" ? "Confirme" : "Inscrit"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {guidesNeeded > accompagnateurs.length && (
                  <div className="mt-2 flex items-center gap-2 rounded-[12px] bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
                    <span className="text-[14px]">⚠️</span>
                    <span className="text-[12px] font-medium text-amber-600 dark:text-amber-400">
                      {guidesNeeded - accompagnateurs.length} accompagnateur{guidesNeeded - accompagnateurs.length > 1 ? "s" : ""} recherche{guidesNeeded - accompagnateurs.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <form onSubmit={sendBroadcast} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-[12px] bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
                <span className="text-[14px]">📢</span>
                <span className="text-[12px] font-medium text-blue-600 dark:text-blue-400">
                  Message envoyé à tous les inscrits ({registrations.length})
                </span>
              </div>
              <textarea
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Écrire un message aux inscrits..."
                rows={3}
                className="w-full rounded-[12px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary placeholder:text-content-muted"
              />
              <button
                type="submit"
                disabled={sending || !msgBody.trim()}
                className="btn-gradient self-end rounded-[12px] px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {sending ? "Envoi..." : "Envoyer à tous"}
              </button>
            </form>

            {messages.length > 0 && (
              <div>
                <h4 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">
                  Historique
                </h4>
                <div className="flex flex-col gap-2">
                  {messages.map((m) => (
                    <div key={m.id} className="rounded-[12px] bg-surface-secondary p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-content-primary">
                          {m.sender ? `${m.sender.first_name} ${m.sender.last_name}` : "Bureau"}
                        </span>
                        <span className="text-[10px] text-content-muted">
                          {new Date(m.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] text-content-secondary">
                        {m.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CounterCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-[12px] bg-surface-secondary p-3">
      <p className="text-[10px] font-semibold uppercase text-content-muted">{label}</p>
      <p className={cn("mt-0.5 text-xl font-bold tabular-nums", color)}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-content-muted">{sub}</p>}
    </div>
  );
}
