"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { GradientHeader } from "@/components/layout/gradient-header";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface EventData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  price: number;
  max_attendees: number | null;
  max_benevoles: number | null;
  category: string | null;
  event_registrations: {
    member_id: string;
    nb_personnes: number;
    is_benevole: string | null;
    status: string;
    members: { first_name: string; last_name: string };
  }[];
}

export default function EvenementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadEvent() {
    const supabase = createClient();
    const { data } = await supabase
      .from("events")
      .select(
        "*, event_registrations(*, members:member_id(first_name, last_name))"
      )
      .eq("id", id)
      .single();
    if (data) setEvent(data as EventData);
  }

  async function loadMember() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (data) setMyMemberId(data.id);
  }

  useEffect(() => {
    loadEvent();
    loadMember();
  }, [id]);

  async function handleInscription() {
    if (!myMemberId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("event_registrations").upsert(
      {
        event_id: id,
        member_id: myMemberId,
        nb_personnes: 1,
        status: "inscrit",
      },
      { onConflict: "event_id,member_id" }
    );
    await loadEvent();
    setLoading(false);
  }

  async function handleBenevole() {
    if (!myMemberId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("event_registrations").upsert(
      {
        event_id: id,
        member_id: myMemberId,
        nb_personnes: 1,
        is_benevole: "benevole",
        status: "inscrit",
      },
      { onConflict: "event_id,member_id" }
    );
    await loadEvent();
    setLoading(false);
  }

  async function handleCancel() {
    if (!myMemberId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", id)
      .eq("member_id", myMemberId);
    await loadEvent();
    setLoading(false);
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const myRegistration = event.event_registrations.find(
    (r) => r.member_id === myMemberId
  );
  const inscrits = event.event_registrations.filter((r) => !r.is_benevole);
  const benevoles = event.event_registrations.filter((r) => r.is_benevole);
  const isFull = event.max_attendees
    ? inscrits.length >= event.max_attendees
    : false;
  const d = new Date(event.date);

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={event.title}
        subtitle={`${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${event.location ? ` · ${event.location}` : ""}`}
        backHref="/amicaliste/evenements"
      />

      {/* Info */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {event.price > 0 ? (
            <Badge variant="default">{fmt(event.price)}</Badge>
          ) : (
            <Badge variant="success">Gratuit</Badge>
          )}
          {event.category && <Badge variant="neutral">{event.category}</Badge>}
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
        {event.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
            {event.description}
          </p>
        )}
      </div>

      {/* Inscription */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Votre inscription
        </h3>
        {myRegistration ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-content-primary">
                Vous êtes inscrit{myRegistration.is_benevole ? " comme bénévole" : ""}
              </p>
              <p className="text-[11px] text-content-muted">
                {myRegistration.nb_personnes} personne{myRegistration.nb_personnes > 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-full bg-red-50 px-4 py-2 text-[12px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
            >
              Se désinscrire
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleInscription}
              disabled={loading || isFull}
              className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {isFull ? "Complet" : "S'inscrire"}
            </button>
            {event.max_benevoles !== 0 && (
              <button
                type="button"
                onClick={handleBenevole}
                disabled={loading}
                className="flex-1 rounded-[14px] bg-surface-secondary px-4 py-3 text-[13px] font-semibold text-content-primary"
              >
                Devenir bénévole
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inscrits */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Inscrits ({inscrits.length}
          {event.max_attendees ? ` / ${event.max_attendees}` : ""})
        </h3>
        {inscrits.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">Aucun inscrit</p>
        ) : (
          <div className="flex flex-col gap-2">
            {inscrits.map((r) => (
              <div key={r.member_id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-600 dark:bg-brand-500/10">
                  {r.members.first_name[0]}{r.members.last_name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-content-primary">
                    {r.members.first_name} {r.members.last_name}
                  </p>
                  <p className="text-[11px] text-content-muted">
                    {r.nb_personnes} personne{r.nb_personnes > 1 ? "s" : ""}
                  </p>
                </div>
                <Badge variant={r.status === "inscrit" ? "success" : "neutral"}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bénévoles */}
      {(benevoles.length > 0 || event.max_benevoles) && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Bénévoles ({benevoles.length}
            {event.max_benevoles ? ` / ${event.max_benevoles}` : ""})
          </h3>
          {benevoles.length === 0 ? (
            <p className="py-2 text-center text-[13px] text-content-muted">Aucun bénévole</p>
          ) : (
            <div className="flex flex-col gap-2">
              {benevoles.map((r) => (
                <div key={r.member_id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[12px] font-bold text-amber-600 dark:bg-amber-500/10">
                    {r.members.first_name[0]}{r.members.last_name[0]}
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-content-primary">
                    {r.members.first_name} {r.members.last_name}
                  </span>
                  <Badge variant="warning">Bénévole</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
