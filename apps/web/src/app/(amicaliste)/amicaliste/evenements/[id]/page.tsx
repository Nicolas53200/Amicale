"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cancelRegistration } from "@/lib/actions/events";
import { Badge } from "@/components/ui/badge";
import { EventInscriptionModal, computeAge } from "@/components/events/event-inscription-modal";
import { useToast } from "@/components/ui/toast";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

function timeBadge(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff > 1 && diff <= 30) return `Dans ${diff} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  icon: string | null;
  color: string | null;
  price: number;
  max_attendees: number | null;
  max_benevoles: number | null;
  category: string | null;
  children_allowed: boolean;
  child_age_limit: number | null;
  max_adults_per_household: number | null;
  event_registrations: {
    member_id: string;
    nb_personnes: number;
    is_benevole: string | null;
    benevole_poste: string | null;
    benevole_status: string | null;
    status: string;
    members: { first_name: string; last_name: string };
  }[];
}

interface MemberWithChildren {
  id: string;
  nb_enfants: number;
  enfants_noms: string[];
  enfants_naiss: string[];
}

export default function EvenementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [myMember, setMyMember] = useState<MemberWithChildren | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inscritsSectionOpen, setInscritsSectionOpen] = useState(false);
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
      .eq("published", true)
      .single();
    if (data) setEvent(data as EventData);
  }

  async function loadMember() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("members")
      .select("id, nb_enfants, enfants_noms, enfants_naiss")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setMyMemberId(data.id);
      setMyMember(data as MemberWithChildren);
    }
  }

  useEffect(() => {
    loadEvent();
    loadMember();
  }, [id]);

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelRegistration(id);
      showToast("Inscription annulée", "info");
      await loadEvent();
    } catch {
      showToast("Erreur lors de la désinscription", "error");
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
  const benevolesValides = benevoles.filter((r) => r.benevole_status === "valide");
  const benevolesAttente = benevoles.filter((r) => r.benevole_status === "attente" || !r.benevole_status);
  const totalInscrits = inscrits.reduce((s, r) => s + r.nb_personnes, 0);
  const isFull = event.max_attendees ? totalInscrits >= event.max_attendees : false;
  const d = new Date(event.date);
  const headerColor = event.color || "#E8553A";
  const benevoleSlots = event.max_benevoles ? event.max_benevoles - benevoles.length : null;

  return (
    <div className="flex flex-col gap-0">
      {/* Hero header */}
      <div
        className="relative -mx-4 -mt-6 flex flex-col justify-end overflow-hidden"
        style={{
          height: "220px",
          background: event.image_url
            ? `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 50%), url(${event.image_url}) center/cover`
            : headerColor,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {!event.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/5" />
        )}

        <button
          onClick={() => router.back()}
          className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40"
          style={{ marginTop: "env(safe-area-inset-top)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div
          className="absolute left-3 top-3 z-10"
          style={{ marginTop: "env(safe-area-inset-top)", marginLeft: "42px" }}
        >
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {timeBadge(event.date)}
          </span>
        </div>

        <div className="relative z-[1] p-4">
          {event.location && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.location}
            </p>
          )}
          <h1 className="text-xl font-extrabold text-white leading-tight">{event.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-white/85">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
            {` · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        {/* 3-column info grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-[12px] bg-surface-secondary p-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="mt-1 text-[12px] font-bold text-content-primary">
              {d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
            <p className="text-[10px] text-content-muted">Date</p>
          </div>
          <div className="flex flex-col items-center rounded-[12px] bg-surface-secondary p-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3478F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="mt-1 text-[12px] font-bold text-content-primary">
              {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-[10px] text-content-muted">Heure</p>
          </div>
          <div className="flex flex-col items-center rounded-[12px] bg-surface-secondary p-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="mt-1 text-[11px] font-bold text-content-primary text-center">
              {event.location || "—"}
            </p>
            <p className="text-[10px] text-content-muted">Lieu</p>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-content-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Description
            </h3>
            <p className="text-[12px] leading-relaxed text-content-secondary">
              {event.description}
            </p>
          </div>
        )}

        {/* Info badges */}
        <div className="flex flex-wrap gap-2 px-1">
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

        {/* Bénévoles */}
        {(benevoles.length > 0 || (event.max_benevoles && event.max_benevoles > 0)) && (
          <div className="rounded-[16px] bg-surface-elevated shadow-sm">
            <button
              type="button"
              onClick={() => setBenevolesSectionOpen(!benevolesSectionOpen)}
              className="flex w-full items-center justify-between p-4"
            >
              <h3 className="flex items-center gap-1.5 text-[12px] font-bold text-content-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Bénévoles ({benevoles.length}
                {event.max_benevoles ? ` / ${event.max_benevoles}` : ""})
              </h3>
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
                className={`text-content-muted transition-transform duration-200 ${benevolesSectionOpen ? "" : "-rotate-90"}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {benevolesSectionOpen && (
              <div className="px-4 pb-4">
                {benevolesValides.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Confirmes ({benevolesValides.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {benevolesValides.map((r) => (
                        <div key={r.member_id} className="flex items-center gap-1.5 rounded-[10px] bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-500/10">
                          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                            {r.members.first_name[0]}{r.members.last_name[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-content-primary">
                              {r.members.first_name} {r.members.last_name}
                            </p>
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">
                              {r.benevole_poste || r.is_benevole}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {benevolesAttente.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      En attente ({benevolesAttente.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {benevolesAttente.map((r) => (
                        <div key={r.member_id} className="flex items-center gap-1.5 rounded-[10px] bg-amber-50 px-2.5 py-1.5 dark:bg-amber-500/10">
                          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F59E0B] text-[9px] font-bold text-white">
                            {r.members.first_name[0]}{r.members.last_name[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-content-primary">
                              {r.members.first_name} {r.members.last_name}
                            </p>
                            <p className="text-[9px] text-amber-600 dark:text-amber-400">
                              {r.benevole_poste || r.is_benevole} — en attente
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {benevoleSlots !== null && benevoleSlots > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#F59E0B] px-3 py-2.5 text-[12px] font-bold text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                    {benevoleSlots} poste{benevoleSlots > 1 ? "s" : ""} disponible{benevoleSlots > 1 ? "s" : ""} — Je me porte volontaire
                  </button>
                ) : benevoleSlots !== null && benevoleSlots <= 0 ? (
                  <div className="mt-2 rounded-[8px] bg-[#E8F5EE] p-2 text-center text-[11px] font-semibold text-[#1E7A4A] dark:bg-emerald-500/10 dark:text-emerald-400">
                    Tous les postes sont pourvus
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Inscrits */}
        <div className="rounded-[16px] bg-surface-elevated shadow-sm">
          <button
            type="button"
            onClick={() => setInscritsSectionOpen(!inscritsSectionOpen)}
            className="flex w-full items-center justify-between p-4"
          >
            <h3 className="flex items-center gap-1.5 text-[12px] font-bold text-content-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Inscrits ({totalInscrits}{event.max_attendees ? ` / ${event.max_attendees}` : ""})
            </h3>
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
              className={`text-content-muted transition-transform duration-200 ${inscritsSectionOpen ? "" : "-rotate-90"}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {inscritsSectionOpen && (
            <div className="px-4 pb-4">
              {inscrits.length === 0 ? (
                <div className="rounded-[12px] bg-surface-secondary py-3.5 text-center text-[12px] text-content-muted">
                  Aucun inscrit pour le moment
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {inscrits.map((r) => {
                    const statusColor = r.status === "inscrit" || r.status === "acceptee"
                      ? "text-[#1E7A4A]"
                      : "text-[#F59E0B]";
                    return (
                      <div key={r.member_id} className="flex items-center gap-1.5 rounded-[10px] bg-surface-secondary px-2.5 py-1.5">
                        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#8B5CF6] text-[9px] font-bold text-white">
                          {r.members.first_name[0]}{r.members.last_name[0]}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-content-primary">
                            {r.members.first_name} {r.members.last_name}
                          </p>
                          <p className={`text-[9px] ${statusColor}`}>
                            {r.status === "inscrit" || r.status === "acceptee" ? "Confirmé" : "En attente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {myRegistration ? (
            <>
              <div className="rounded-[12px] bg-surface-elevated p-3 text-center">
                <p className="text-[13px] font-medium text-content-primary">
                  Vous etes inscrit{myRegistration.is_benevole ? ` (${myRegistration.benevole_poste || myRegistration.is_benevole})` : ""}
                </p>
                {myRegistration.benevole_status && (
                  <p className={`text-[11px] font-semibold ${myRegistration.benevole_status === "valide" ? "text-emerald-600" : myRegistration.benevole_status === "refuse" ? "text-red-500" : "text-amber-600"}`}>
                    {myRegistration.benevole_status === "valide" ? "Candidature validee" : myRegistration.benevole_status === "refuse" ? "Candidature refusee" : "Candidature en attente"}
                  </p>
                )}
                <p className="text-[11px] text-content-muted">
                  {myRegistration.nb_personnes} pers.
                  {event.price > 0 && ` · ${fmt(event.price * myRegistration.nb_personnes)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded-[12px] bg-surface-secondary px-4 py-3 text-[13px] font-bold text-content-primary"
              >
                Se désinscrire
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={isFull}
                className="flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-3 text-[13px] font-bold text-white disabled:opacity-50"
                style={{ background: headerColor }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {isFull ? "Complet" : "S'inscrire"}
              </button>
              <Link
                href="/amicaliste/evenements"
                className="flex items-center justify-center gap-1.5 rounded-[12px] bg-surface-secondary px-4 py-3 text-[13px] font-bold text-content-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Fermer
              </Link>
            </>
          )}
        </div>
      </div>

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
        childrenAllowed={event.children_allowed}
        childAgeLimit={event.child_age_limit ?? 16}
        maxAdultsPerHousehold={event.max_adults_per_household ?? 6}
        memberChildren={
          myMember
            ? ((myMember.enfants_noms as string[]) || []).map((name, i) => ({
                index: i,
                name,
                age: ((myMember.enfants_naiss as string[]) || [])[i]
                  ? computeAge(((myMember.enfants_naiss as string[]) || [])[i]!)
                  : null,
              }))
            : []
        }
        onSuccess={loadEvent}
      />
    </div>
  );
}
