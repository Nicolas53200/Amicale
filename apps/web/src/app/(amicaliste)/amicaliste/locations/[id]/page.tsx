"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GradientHeader } from "@/components/layout/gradient-header";
import { BookingCalendar } from "@/components/assets/booking-calendar";
import { PhotoCarousel } from "@/components/assets/photo-carousel";

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
  capacity: number | null;
  status: string | null;
  tags: string[] | null;
  photos: string[];
  cover_index: number | null;
}

export default function LocationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function loadAsset() {
    const supabase = createClient();
    const { data } = await supabase
      .from("assets")
      .select("id, name, type, description, daily_rate, deposit, rules, capacity, status, tags, photos, cover_index")
      .eq("id", id)
      .single();
    if (data) setAsset(data as AssetData);
  }

  useEffect(() => {
    loadAsset();
  }, [id]);

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={asset.name}
        subtitle={typeLabels[asset.type] || asset.type}
        backHref="/amicaliste/locations"
      />

      {asset.photos && asset.photos.length > 0 && (
        <PhotoCarousel photos={asset.photos} coverIndex={asset.cover_index} />
      )}

      {/* Info */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{fmt(asset.daily_rate)}/jour</Badge>
          {asset.deposit > 0 && (
            <Badge variant="neutral">Caution : {fmt(asset.deposit)}</Badge>
          )}
          {asset.capacity && (
            <Badge variant="neutral">{asset.capacity} pers.</Badge>
          )}
          {asset.status && asset.status !== "disponible" && (
            <Badge variant={asset.status === "maintenance" ? "danger" : "warning"}>
              {asset.status === "reserve" ? "Reserve" : asset.status === "maintenance" ? "Maintenance" : "Indisponible"}
            </Badge>
          )}
        </div>
        {asset.tags && asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.map((tag, i) => (
              <span key={i} className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {tag}
              </span>
            ))}
          </div>
        )}
        {asset.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
            {asset.description}
          </p>
        )}
      </div>

      {/* Règlement */}
      {asset.rules && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Règlement intérieur
          </h3>
          <p className="whitespace-pre-wrap text-[13px] text-content-secondary">
            {asset.rules}
          </p>
        </div>
      )}

      {/* Calendrier */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Calendrier
        </h3>
        <BookingCalendar assetId={id} />
      </div>

      {/* Réservation */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Demander une réservation
        </h3>
        {success ? (
          <div className="text-center">
            <p className="text-[13px] font-medium text-green-600 dark:text-green-400">
              Demande envoyée avec succès
            </p>
            <p className="mt-1 text-[11px] text-content-muted">
              Votre demande sera examinée par le bureau
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-3 rounded-full bg-surface-secondary px-4 py-2 text-[12px] font-semibold text-content-primary"
            >
              Nouvelle demande
            </button>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Date de début
                </label>
                <Input name="start_date" type="date" required />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Date de fin
                </label>
                <Input name="end_date" type="date" required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Notes
              </label>
              <Textarea name="notes" rows={2} placeholder="Informations complémentaires..." />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
            >
              {submitting ? "Envoi..." : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
