"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        <p className="text-sm text-content-muted">Chargement...</p>
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/amicaliste/evenements"
          className="text-sm text-brand-500 hover:underline"
        >
          ← Événements
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-content-primary">
          {event.title}
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          {new Date(event.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {event.location && ` · ${event.location}`}
        </p>
        <div className="mt-2 flex gap-2">
          {event.price > 0 ? (
            <Badge variant="default">{fmt(event.price)}</Badge>
          ) : (
            <Badge variant="success">Gratuit</Badge>
          )}
          {event.category && <Badge variant="neutral">{event.category}</Badge>}
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-content-secondary">{event.description}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Votre inscription</CardTitle>
        </CardHeader>
        <CardContent>
          {myRegistration ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-primary">
                  Vous êtes inscrit{myRegistration.is_benevole ? " comme bénévole" : ""}
                </p>
                <p className="text-xs text-content-muted">
                  {myRegistration.nb_personnes} personne{myRegistration.nb_personnes > 1 ? "s" : ""}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleCancel} disabled={loading}>
                Se désinscrire
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleInscription} disabled={loading || isFull}>
                {isFull ? "Complet" : "S'inscrire"}
              </Button>
              {event.max_benevoles !== 0 && (
                <Button variant="secondary" onClick={handleBenevole} disabled={loading}>
                  Devenir bénévole
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Inscrits ({inscrits.length}
              {event.max_attendees ? ` / ${event.max_attendees}` : ""})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inscrits.length === 0 ? (
              <p className="text-sm text-content-muted">Aucun inscrit</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {inscrits.map((r) => (
                  <li key={r.member_id} className="text-sm text-content-secondary">
                    {r.members.first_name} {r.members.last_name}
                    {r.nb_personnes > 1 && ` (+${r.nb_personnes - 1})`}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {(benevoles.length > 0 || event.max_benevoles) && (
          <Card>
            <CardHeader>
              <CardTitle>
                Bénévoles ({benevoles.length}
                {event.max_benevoles ? ` / ${event.max_benevoles}` : ""})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {benevoles.length === 0 ? (
                <p className="text-sm text-content-muted">Aucun bénévole</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {benevoles.map((r) => (
                    <li key={r.member_id} className="text-sm text-content-secondary">
                      {r.members.first_name} {r.members.last_name}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
