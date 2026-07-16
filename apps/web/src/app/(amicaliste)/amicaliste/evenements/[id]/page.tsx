"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cancelRegistration } from "@/lib/actions/events";
import { Badge } from "@/components/ui/badge";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EventInscriptionModal } from "@/components/events/event-inscription-modal";
import { useToast } from "@/components/ui/toast";

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
  const id = params.id as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inscritsSectionOpen, setInscritsSectionOpen] = useState(true);
  const [benevolesSectionOpen, setBenevolesSectionOpen] = useState(true);
  const { showToast } = useToast();

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

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelRegistration(id);
      showToast("Inscription annulee", "info");
      await loadEvent();
    } catch {
      showToast("Erreur lors de la desinscription", "error");
    } finally {
      setLoading(false);
    }
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
  const totalInscrits = inscrits.reduce((s, r) => s + r.nb_personnes, 0);
  const isFull = event.max_attendees ? totalInscrits >= event.max_attendees : false;
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
          {event.max_attendees && (
            <Badge variant="neutral">
              {totalInscrits}/{event.max_attendees} places
            </Badge>
          )}
        </div>
        {event.description && (
          <p className="mt-3 text-[13px] leading-relaxed text-content-secondary">
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
                Vous etes inscrit{myRegistration.is_benevole ? ` comme ${myRegistration.is_benevole}` : ""}
              </p>
              <p className="text-[11px] text-content-muted">
                {myRegistration.nb_personnes} personne{myRegistration.nb_personnes > 1 ? "s" : ""}
                {event.price > 0 && ` · Total : ${fmt(event.price * myRegistration.nb_personnes)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-full bg-red-50 px-4 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
            >
              Se desinscrire
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={isFull}
            className="btn-gradient w-full rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {isFull ? "Complet" : "S'inscrire"}
          </button>
        )}
      </div>

      {/* Inscrits */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setInscritsSectionOpen(!inscritsSectionOpen)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-[14px] font-bold text-content-primary">
            Inscrits ({totalInscrits}
            {event.max_attendees ? ` / ${event.max_attendees}` : ""})
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
            className={`text-content-muted transition-transform ${inscritsSectionOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {inscritsSectionOpen && (
          <div className="mt-3">
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
        )}
      </div>

      {/* Benevoles */}
      {(benevoles.length > 0 || event.max_benevoles) && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setBenevolesSectionOpen(!benevolesSectionOpen)}
            className="flex w-full items-center justify-between"
          >
            <h3 className="text-[14px] font-bold text-content-primary">
              Benevoles ({benevoles.length}
              {event.max_benevoles ? ` / ${event.max_benevoles}` : ""})
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
              className={`text-content-muted transition-transform ${benevolesSectionOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {benevolesSectionOpen && (
            <div className="mt-3">
              {benevoles.length === 0 ? (
                <p className="py-2 text-center text-[13px] text-content-muted">Aucun benevole</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {benevoles.map((r) => (
                    <div key={r.member_id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[12px] font-bold text-amber-600 dark:bg-amber-500/10">
                        {r.members.first_name[0]}{r.members.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <span className="text-[13px] font-medium text-content-primary">
                          {r.members.first_name} {r.members.last_name}
                        </span>
                        {r.is_benevole && r.is_benevole !== "benevole" && (
                          <p className="text-[11px] text-content-muted capitalize">{r.is_benevole}</p>
                        )}
                      </div>
                      <Badge variant="warning">Benevole</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <EventInscriptionModal
        open={showModal}
        onOpenChange={setShowModal}
        eventId={event.id}
        eventTitle={event.title}
        price={event.price}
        maxAttendees={event.max_attendees}
        currentInscrits={totalInscrits}
        maxBenevoles={event.max_benevoles}
        currentBenevoles={benevoles.length}
        onSuccess={loadEvent}
      />
    </div>
  );
}
