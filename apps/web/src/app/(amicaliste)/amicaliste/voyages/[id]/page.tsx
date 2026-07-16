"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cancelTripRegistration } from "@/lib/actions/trips";
import { Badge } from "@/components/ui/badge";
import { GradientHeader } from "@/components/layout/gradient-header";
import { TripInscriptionModal } from "@/components/trips/trip-inscription-modal";
import { useToast } from "@/components/ui/toast";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface TripData {
  id: string;
  destination: string;
  description: string | null;
  start_date: string;
  end_date: string;
  price_adult: number;
  price_child: number | null;
  max_seats: number | null;
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
  const id = params.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inscritsSectionOpen, setInscritsSectionOpen] = useState(true);
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
    loadTrip();
    loadMember();
  }, [id]);

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelTripRegistration(id);
      showToast("Inscription annulee", "info");
      await loadTrip();
    } catch {
      showToast("Erreur lors de la desinscription", "error");
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

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={trip.destination}
        subtitle={`${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} → ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · ${days} jour${days > 1 ? "s" : ""}`}
        backHref="/amicaliste/voyages"
      />

      {/* Info */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{fmt(trip.price_adult)}/adulte</Badge>
          {trip.price_child !== null && (
            <Badge variant="neutral">{fmt(trip.price_child)}/enfant</Badge>
          )}
          {isFull && <Badge variant="danger">Complet</Badge>}
          {trip.max_seats && (
            <Badge variant="neutral">
              {totalSeats}/{trip.max_seats} places
            </Badge>
          )}
        </div>
        {trip.description && (
          <p className="mt-3 text-[13px] leading-relaxed text-content-secondary">
            {trip.description}
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
                Vous etes inscrit
              </p>
              <p className="text-[11px] text-content-muted">
                {myRegistration.nb_adults} adulte{myRegistration.nb_adults > 1 ? "s" : ""}
                {myRegistration.nb_children > 0 &&
                  `, ${myRegistration.nb_children} enfant${myRegistration.nb_children > 1 ? "s" : ""}`}
                {" · "}
                Total : {fmt(myRegistration.total_amount)}
              </p>
              <div className="mt-2">
                <Badge
                  variant={myRegistration.payment_status === "paye" ? "success" : "warning"}
                >
                  {myRegistration.payment_status === "paye" ? "Paye" : "En attente de paiement"}
                </Badge>
              </div>
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
            Inscrits ({trip.trip_registrations.length}
            {trip.max_seats ? ` — ${totalSeats}/${trip.max_seats} places` : ""})
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
            {trip.trip_registrations.length === 0 ? (
              <p className="py-2 text-center text-[13px] text-content-muted">Aucun inscrit</p>
            ) : (
              <div className="flex flex-col gap-2">
                {trip.trip_registrations.map((r) => (
                  <div key={r.member_id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[12px] font-bold text-blue-600 dark:bg-blue-500/10">
                      {r.members.first_name[0]}{r.members.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-content-primary">
                        {r.members.first_name} {r.members.last_name}
                      </p>
                      <p className="text-[11px] text-content-muted">
                        {r.nb_adults} ad.{r.nb_children > 0 && ` + ${r.nb_children} enf.`}
                        {" · "}
                        {fmt(r.total_amount)}
                      </p>
                    </div>
                    <Badge
                      variant={r.payment_status === "paye" ? "success" : "warning"}
                    >
                      {r.payment_status === "paye" ? "Paye" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TripInscriptionModal
        open={showModal}
        onOpenChange={setShowModal}
        tripId={trip.id}
        destination={trip.destination}
        priceAdult={trip.price_adult}
        priceChild={trip.price_child}
        maxSeats={trip.max_seats}
        currentSeats={totalSeats}
        onSuccess={loadTrip}
      />
    </div>
  );
}
