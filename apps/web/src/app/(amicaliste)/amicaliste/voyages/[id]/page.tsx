"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        <p className="text-sm text-content-muted">Chargement...</p>
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
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/amicaliste/voyages"
          className="text-sm text-brand-500 hover:underline"
        >
          ← Voyages
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-content-primary">
          {trip.destination}
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          {start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          {" → "}
          {end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {days} jour{days > 1 ? "s" : ""}
        </p>
        <div className="mt-2 flex gap-2">
          <Badge variant="default">{fmt(trip.price_adult)}/adulte</Badge>
          {trip.price_child && (
            <Badge variant="neutral">{fmt(trip.price_child)}/enfant</Badge>
          )}
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
      </div>

      {trip.description && (
        <p className="text-sm text-content-secondary">{trip.description}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Votre inscription</CardTitle>
        </CardHeader>
        <CardContent>
          {myRegistration ? (
            <div>
              <p className="text-sm font-medium text-content-primary">
                Vous êtes inscrit
              </p>
              <p className="text-xs text-content-muted">
                {myRegistration.nb_adults} adulte{myRegistration.nb_adults > 1 ? "s" : ""}
                {myRegistration.nb_children > 0 &&
                  `, ${myRegistration.nb_children} enfant${myRegistration.nb_children > 1 ? "s" : ""}`}
                {" · "}
                Total : {fmt(myRegistration.total_amount)}
              </p>
              <Badge
                variant={myRegistration.payment_status === "paye" ? "success" : "warning"}
                className="mt-2"
              >
                {myRegistration.payment_status === "paye" ? "Payé" : "En attente de paiement"}
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-content-muted">Adultes</label>
                  <Input
                    type="number"
                    min={1}
                    value={nbAdults}
                    onChange={(e) => setNbAdults(parseInt(e.target.value) || 1)}
                  />
                </div>
                {trip.price_child !== null && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-content-muted">Enfants</label>
                    <Input
                      type="number"
                      min={0}
                      value={nbChildren}
                      onChange={(e) => setNbChildren(parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-content-primary">
                Total : {fmt(nbAdults * trip.price_adult + nbChildren * (trip.price_child ?? 0))}
              </p>
              <Button onClick={handleInscription} disabled={loading || isFull}>
                {isFull ? "Complet" : "S'inscrire"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Inscrits ({trip.trip_registrations.length}
            {trip.max_seats ? ` — ${totalSeats}/${trip.max_seats} places` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trip.trip_registrations.length === 0 ? (
            <p className="text-sm text-content-muted">Aucun inscrit</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {trip.trip_registrations.map((r) => (
                <li key={r.member_id} className="text-sm text-content-secondary">
                  {r.members.first_name} {r.members.last_name}
                  {" — "}
                  {r.nb_adults} ad.{r.nb_children > 0 && ` + ${r.nb_children} enf.`}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
