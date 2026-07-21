"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cancelTripRegistration } from "@/lib/actions/trips";
import { Badge } from "@/components/ui/badge";
import { TripInscriptionModal } from "@/components/trips/trip-inscription-modal";
import { useToast } from "@/components/ui/toast";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface TripData {
  id: string;
  name: string | null;
  destination: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  price_adult: number;
  price_child: number | null;
  max_seats: number | null;
  min_seats: number | null;
  duration: string | null;
  transport: string | null;
  accommodation: string | null;
  color: string | null;
  children_allowed: boolean;
  max_adults_per_household: number | null;
  registration_deadline: string | null;
  child_age_limit: number | null;
  guides_needed: number | null;
  included: string[] | null;
  not_included: string[] | null;
  itinerary: string[] | null;
  trip_registrations: {
    member_id: string;
    nb_adults: number;
    nb_children: number;
    total_amount: number;
    payment_status: string;
    members: { first_name: string; last_name: string };
  }[];
}

export default function VoyageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inscritsSectionOpen, setInscritsSectionOpen] = useState(false);
  const { showToast } = useToast();

  async function loadTrip() {
    const supabase = createClient();
    const { data } = await supabase
      .from("trips")
      .select(
        "*, trip_registrations(*, members:member_id(first_name, last_name))"
      )
      .eq("id", id)
      .single();
    if (data) setTrip(data as TripData);
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
    void loadTrip();
    void loadMember();
  }, [id]);

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelTripRegistration(id);
      showToast("Inscription annulée", "info");
      await loadTrip();
    } catch {
      showToast("Erreur lors de la désinscription", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const myRegistration = trip.trip_registrations.find(
    (r) => r.member_id === myMemberId
  );
  const totalSeats = trip.trip_registrations.reduce((s, r) => s + r.nb_adults + r.nb_children, 0);
  const isFull = trip.max_seats ? totalSeats >= trip.max_seats : false;
  const deadlinePassed = trip.registration_deadline
    ? new Date(trip.registration_deadline) < new Date()
    : false;
  const headerColor = trip.color || "#3478F6";
  const jaugePct = trip.max_seats ? Math.min(100, Math.round((totalSeats / trip.max_seats) * 100)) : 0;
  const minReached = trip.min_seats ? totalSeats >= trip.min_seats : true;

  return (
    <div className="flex flex-col gap-0">
      {/* Hero header */}
      <div
        className="relative -mx-4 -mt-6 flex flex-col justify-end overflow-hidden"
        style={{
          height: "220px",
          background: trip.image_url
            ? `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 50%), url(${trip.image_url}) center/cover`
            : headerColor,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {!trip.image_url && (
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
          className="absolute left-12 top-3 z-10 flex items-center gap-2"
          style={{ marginTop: "env(safe-area-inset-top)" }}
        >
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {isFull ? "Complet" : deadlinePassed ? "Fermé" : "Ouvert"}
          </span>
          <span className="rounded-[10px] bg-black/40 px-3 py-1 text-[15px] font-bold text-white">
            {fmt(trip.price_adult)}
          </span>
        </div>

        <div className="relative z-[1] p-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
            {trip.destination}
          </p>
          <h1 className="text-xl font-extrabold text-white leading-tight">
            {trip.name || trip.destination}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-white/85">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} → {end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        {/* 3-column stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-[12px] bg-surface-secondary p-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="mt-1 text-[12px] font-bold text-content-primary">
              {trip.duration || `${days} jour${days > 1 ? "s" : ""}`}
            </p>
            <p className="text-[10px] text-content-muted">Durée</p>
          </div>
          <div className="flex flex-col items-center rounded-[12px] bg-surface-secondary p-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3478F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="mt-1 text-[12px] font-bold text-content-primary">
              {totalSeats}{trip.max_seats ? `/${trip.max_seats}` : ""}
            </p>
            <p className="text-[10px] text-content-muted">Places</p>
          </div>
          <div className="flex flex-col items-center rounded-[12px] bg-surface-secondary p-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="mt-1 text-[12px] font-bold text-content-primary">
              {fmt(trip.price_adult)}
            </p>
            <p className="text-[10px] text-content-muted">Par pers.</p>
          </div>
        </div>

        {/* Jauge inscription */}
        {trip.max_seats && (
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-bold text-content-primary">
                Inscriptions
              </span>
              <span className="text-[11px] font-semibold text-content-muted">
                {totalSeats} / {trip.max_seats} places
              </span>
            </div>
            <div className="h-[10px] overflow-hidden rounded-[5px] bg-surface-secondary">
              <div
                className="h-full rounded-[5px] transition-all duration-500"
                style={{
                  width: `${jaugePct}%`,
                  background: jaugePct >= 100
                    ? "#E8553A"
                    : jaugePct >= 75
                      ? "#F59E0B"
                      : "#1E7A4A",
                }}
              />
            </div>
            {trip.min_seats && (
              <p className="mt-2 text-[11px] text-content-muted">
                {minReached
                  ? "Minimum atteint"
                  : `Minimum requis : ${trip.min_seats} personnes`}
              </p>
            )}
          </div>
        )}

        {/* Transport & Hébergement */}
        {(trip.transport || trip.accommodation) && (
          <div className="grid grid-cols-2 gap-2">
            {trip.transport && (
              <div className="rounded-[16px] bg-surface-elevated p-2.5 shadow-sm">
                <p className="mb-1 text-[10px] font-semibold uppercase text-content-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5 inline">
                    <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" /><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                    <circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" />
                  </svg>
                  {" "}Transport
                </p>
                <p className="text-[12px] font-semibold text-content-primary">{trip.transport}</p>
              </div>
            )}
            {trip.accommodation && (
              <div className="rounded-[16px] bg-surface-elevated p-2.5 shadow-sm">
                <p className="mb-1 text-[10px] font-semibold uppercase text-content-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5 inline">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {" "}Hébergement
                </p>
                <p className="text-[12px] font-semibold text-content-primary">{trip.accommodation}</p>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {trip.description && (
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-2 text-[12px] font-bold text-content-primary">Programme</h3>
            <p className="text-[12px] leading-relaxed text-content-secondary">
              {trip.description}
            </p>
          </div>
        )}

        {/* Inclus / Non inclus */}
        {((trip.included && trip.included.length > 0) || (trip.not_included && trip.not_included.length > 0)) && (
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            {trip.included && trip.included.length > 0 && (
              <div className={trip.not_included && trip.not_included.length > 0 ? "mb-4" : ""}>
                <h3 className="mb-2 text-[12px] font-bold text-[#1E7A4A]">Le tarif comprend</h3>
                <div className="flex flex-col gap-1.5">
                  {trip.included.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-[11px] text-[#1E7A4A]">✓</span>
                      <span className="text-[12px] text-content-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {trip.not_included && trip.not_included.length > 0 && (
              <div>
                <h3 className="mb-2 text-[12px] font-bold text-[#E8553A]">Non inclus</h3>
                <div className="flex flex-col gap-1.5">
                  {trip.not_included.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-[11px] text-[#E8553A]">✗</span>
                      <span className="text-[12px] text-content-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practical info */}
        {(trip.registration_deadline || trip.max_adults_per_household || (trip.children_allowed && trip.child_age_limit)) && (
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-2 text-[12px] font-bold text-content-primary">Informations pratiques</h3>
            <div className="flex flex-col gap-1.5">
              {trip.registration_deadline && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">📅</span>
                  <span className="text-[12px] text-content-secondary">
                    Inscription avant le {new Date(trip.registration_deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {deadlinePassed && <Badge variant="danger">Expirée</Badge>}
                </div>
              )}
              {trip.max_adults_per_household && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">👥</span>
                  <span className="text-[12px] text-content-secondary">
                    Max {trip.max_adults_per_household} adulte{trip.max_adults_per_household > 1 ? "s" : ""} par foyer
                  </span>
                </div>
              )}
              {trip.children_allowed && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">👶</span>
                  <span className="text-[12px] text-content-secondary">
                    Enfants acceptés{trip.child_age_limit ? ` (jusqu'à ${trip.child_age_limit} ans)` : ""}
                    {trip.price_child !== null ? ` · ${fmt(trip.price_child)}/enfant` : ""}
                  </span>
                </div>
              )}
            </div>
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
              Inscrits ({trip.trip_registrations.length}
              {trip.max_seats ? ` — ${totalSeats}/${trip.max_seats}` : ""})
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
              {trip.trip_registrations.length === 0 ? (
                <div className="rounded-[12px] bg-surface-secondary py-3.5 text-center text-[12px] text-content-muted">
                  Aucun inscrit pour le moment
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {trip.trip_registrations.map((r) => (
                    <div key={r.member_id} className="flex items-center gap-1.5 rounded-[10px] bg-surface-secondary px-2.5 py-1.5">
                      <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#3478F6] text-[9px] font-bold text-white">
                        {r.members.first_name[0]}{r.members.last_name[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-content-primary">
                          {r.members.first_name} {r.members.last_name}
                        </p>
                        <p className="text-[9px] text-content-muted">
                          {r.nb_adults} ad.{r.nb_children > 0 ? ` + ${r.nb_children} enf.` : ""}
                        </p>
                      </div>
                      <Badge variant={r.payment_status === "paye" ? "success" : "warning"}>
                        {r.payment_status === "paye" ? "Payé" : "En attente"}
                      </Badge>
                    </div>
                  ))}
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
                  Vous êtes inscrit
                </p>
                <p className="text-[11px] text-content-muted">
                  {myRegistration.nb_adults} ad.{myRegistration.nb_children > 0 ? ` + ${myRegistration.nb_children} enf.` : ""}
                  {" · "}{fmt(myRegistration.total_amount)}
                </p>
                <div className="mt-1">
                  <Badge variant={myRegistration.payment_status === "paye" ? "success" : "warning"}>
                    {myRegistration.payment_status === "paye" ? "Payé" : "En attente"}
                  </Badge>
                </div>
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
                disabled={isFull || deadlinePassed}
                className="flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-3 text-[13px] font-bold text-white disabled:opacity-50"
                style={{ background: headerColor }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {isFull ? "Complet" : deadlinePassed ? "Fermé" : "S'inscrire"}
              </button>
              <Link
                href="/amicaliste/voyages"
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

      <TripInscriptionModal
        open={showModal}
        onOpenChange={setShowModal}
        tripId={trip.id}
        destination={trip.name || trip.destination}
        priceAdult={trip.price_adult}
        priceChild={trip.price_child}
        maxSeats={trip.max_seats}
        currentSeats={totalSeats}
        childrenAllowed={trip.children_allowed}
        onSuccess={loadTrip}
      />
    </div>
  );
}
