"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GradientHeader } from "@/components/layout/gradient-header";

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
  const [nbAdults, setNbAdults] = useState(1);
  const [nbChildren, setNbChildren] = useState(0);
  const [loading, setLoading] = useState(false);

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

  async function handleInscription() {
    if (!trip || !myMemberId) return;
    setLoading(true);
    const total =
      nbAdults * trip.price_adult +
      nbChildren * (trip.price_child ?? 0);

    const supabase = createClient();
    await supabase.from("trip_registrations").upsert(
      {
        trip_id: id,
        member_id: myMemberId,
        nb_adults: nbAdults,
        nb_children: nbChildren,
        total_amount: total,
        payment_status: "en_attente",
      },
      { onConflict: "trip_id,member_id" }
    );
    await loadTrip();
    setLoading(false);
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
          {trip.price_child && (
            <Badge variant="neutral">{fmt(trip.price_child)}/enfant</Badge>
          )}
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
        {trip.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
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
          <div>
            <p className="text-[13px] font-medium text-content-primary">
              Vous êtes inscrit
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
                {myRegistration.payment_status === "paye" ? "Payé" : "En attente de paiement"}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Adultes</label>
                <Input
                  type="number"
                  min={1}
                  value={nbAdults}
                  onChange={(e) => setNbAdults(parseInt(e.target.value) || 1)}
                />
              </div>
              {trip.price_child !== null && (
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Enfants</label>
                  <Input
                    type="number"
                    min={0}
                    value={nbChildren}
                    onChange={(e) => setNbChildren(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
            <p className="text-[13px] font-semibold text-content-primary">
              Total : {fmt(nbAdults * trip.price_adult + nbChildren * (trip.price_child ?? 0))}
            </p>
            <button
              type="button"
              onClick={handleInscription}
              disabled={loading || isFull}
              className="btn-gradient rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {isFull ? "Complet" : "S'inscrire"}
            </button>
          </div>
        )}
      </div>

      {/* Inscrits */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Inscrits ({trip.trip_registrations.length}
          {trip.max_seats ? ` — ${totalSeats}/${trip.max_seats} places` : ""})
        </h3>
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
                  {r.payment_status === "paye" ? "Payé" : "En attente"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
