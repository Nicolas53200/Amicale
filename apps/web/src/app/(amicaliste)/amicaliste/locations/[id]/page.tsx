"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookingCalendar } from "@/components/assets/booking-calendar";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const typeLabels: Record<string, string> = {
  appartement: "Appartement",
  barnum: "Barnum",
  remorque: "Remorque",
  camping: "Camping-car",
};

interface AssetData {
  id: string;
  name: string;
  type: string;
  description: string | null;
  daily_rate: number;
  deposit: number;
  rules: string | null;
}

export default function LocationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAsset();
  }, [id]);

  async function loadAsset() {
    const supabase = createClient();
    const { data } = await supabase
      .from("assets")
      .select("id, name, type, description, daily_rate, deposit, rules")
      .eq("id", id)
      .single();
    if (data) setAsset(data as AssetData);
  }

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const startDate = form.get("start_date") as string;
    const endDate = form.get("end_date") as string;

    if (!asset) return;

    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = days * asset.daily_rate;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!member) return;

    await supabase.from("asset_bookings").insert({
      asset_id: id,
      member_id: member.id,
      start_date: startDate,
      end_date: endDate,
      total_amount: totalAmount,
      status: "en_attente",
      notes: (form.get("notes") as string) || null,
    });

    setSubmitting(false);
    setSuccess(true);
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-content-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/amicaliste/locations"
          className="text-sm text-brand-500 hover:underline"
        >
          ← Locations
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-content-primary">
          {asset.name}
        </h1>
        <p className="mt-1 text-sm text-content-muted capitalize">
          {typeLabels[asset.type] || asset.type}
        </p>
        <div className="mt-2 flex gap-2">
          <Badge variant="default">{fmt(asset.daily_rate)}/jour</Badge>
          {asset.deposit > 0 && (
            <Badge variant="neutral">Caution : {fmt(asset.deposit)}</Badge>
          )}
        </div>
      </div>

      {asset.description && (
        <p className="text-sm text-content-secondary">{asset.description}</p>
      )}

      {asset.rules && (
        <Card>
          <CardHeader>
            <CardTitle>Règlement intérieur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-content-secondary">
              {asset.rules}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <BookingCalendar assetId={id} />

        <Card>
          <CardHeader>
            <CardTitle>Demander une réservation</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Demande envoyée avec succès
                </p>
                <p className="mt-1 text-xs text-content-muted">
                  Votre demande sera examinée par le bureau
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSuccess(false)}
                >
                  Nouvelle demande
                </Button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-content-muted">
                      Date de début
                    </label>
                    <Input name="start_date" type="date" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-content-muted">
                      Date de fin
                    </label>
                    <Input name="end_date" type="date" required />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-content-muted">
                    Notes
                  </label>
                  <Textarea name="notes" rows={2} placeholder="Informations complémentaires..." />
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Envoi..." : "Envoyer la demande"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
