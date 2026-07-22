"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { requestBooking } from "@/lib/actions/assets";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GradientHeader } from "@/components/layout/gradient-header";
import { BookingCalendar } from "@/components/assets/booking-calendar";
import { PhotoCarousel } from "@/components/assets/photo-carousel";
import { useToast } from "@/components/ui/toast";

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

interface ExistingBooking {
  start_date: string;
  end_date: string;
  status: string;
}

export default function LocationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [myBookings, setMyBookings] = useState<{ id: string; start_date: string; end_date: string; status: string; total_amount: number; notes: string | null }[]>([]);
  const { showToast } = useToast();

  async function loadAsset() {
    const supabase = createClient();
    const { data } = await supabase
      .from("assets")
      .select("id, name, type, description, daily_rate, deposit, rules, capacity, status, tags, photos, cover_index")
      .eq("id", id)
      .single();
    if (data) setAsset(data as AssetData);
  }

  async function loadBookings() {
    const supabase = createClient();
    const { data } = await supabase
      .from("asset_bookings")
      .select("start_date, end_date, status")
      .eq("asset_id", id)
      .in("status", ["validee", "confirmee", "en_attente"]);
    if (data) setExistingBookings(data);
  }

  async function loadMyBookings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!member) return;
    const { data } = await supabase
      .from("asset_bookings")
      .select("id, start_date, end_date, status, total_amount, notes")
      .eq("asset_id", id)
      .eq("member_id", member.id)
      .order("start_date", { ascending: false });
    if (data) setMyBookings(data);
  }

  useEffect(() => {
    loadAsset();
    loadBookings();
    loadMyBookings();
  }, [id]);

  function checkConflict(start: string, end: string) {
    if (!start || !end) {
      setConflict(false);
      return;
    }
    const s = new Date(start);
    const e = new Date(end);
    const hasConflict = existingBookings.some((b) => {
      if (b.status === "refusee") return false;
      const bs = new Date(b.start_date);
      const be = new Date(b.end_date);
      return s < be && e > bs;
    });
    setConflict(hasConflict);
  }

  function handleStartChange(val: string) {
    setStartDate(val);
    checkConflict(val, endDate);
  }

  function handleEndChange(val: string) {
    setEndDate(val);
    checkConflict(startDate, val);
  }

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (conflict) {
      showToast("Les dates choisies sont en conflit avec une réservation existante", "error");
      return;
    }
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    form.set("asset_id", id);

    try {
      await requestBooking(form);
      setSuccess(true);
      showToast("Demande de réservation envoyée", "success");
      loadBookings();
      loadMyBookings();
    } catch {
      showToast("Erreur lors de l'envoi de la demande", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalAmount = days * asset.daily_rate;

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
              {asset.status === "reserve" ? "Réservé" : asset.status === "maintenance" ? "Maintenance" : "Indisponible"}
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

      {/* Mes réservations */}
      {myBookings.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Mes réservations ({myBookings.length})
          </h3>
          <div className="flex flex-col gap-2">
            {myBookings.map((b) => {
              const statusConfig: Record<string, { label: string; cls: string }> = {
                en_attente: { label: "En attente", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
                validee: { label: "Validée", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
                confirmee: { label: "Confirmée", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
                refusee: { label: "Refusée", cls: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" },
                annulee: { label: "Annulée", cls: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400" },
              };
              const st = statusConfig[b.status] ?? { label: b.status, cls: "bg-gray-100 text-gray-600" };
              return (
                <div key={b.id} className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-content-primary">
                      {new Date(b.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      {" → "}
                      {new Date(b.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {fmt(b.total_amount)}
                      {b.notes && ` · ${b.notes}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Réservation */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Demander une réservation
        </h3>
        {success ? (
          <div className="text-center">
            <p className="text-[13px] font-medium text-[#1E7A4A] dark:text-emerald-400">
              Demande envoyée avec succès
            </p>
            <p className="mt-1 text-[11px] text-content-muted">
              Votre demande sera examinée par le bureau
            </p>
            <button
              type="button"
              onClick={() => { setSuccess(false); setStartDate(""); setEndDate(""); setConflict(false); }}
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
                <Input
                  name="start_date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => handleStartChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Date de fin
                </label>
                <Input
                  name="end_date"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => handleEndChange(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {conflict && (
              <div className="rounded-[10px] bg-[#FFD9D2] p-2.5 text-[11px] font-semibold text-[#C43E26] dark:bg-red-500/10 dark:text-red-400">
                Ces dates sont en conflit avec une réservation existante. Choisissez d&apos;autres dates.
              </div>
            )}

            {days > 0 && !conflict && (
              <div className="flex items-center justify-between rounded-[12px] bg-surface-secondary p-3">
                <span className="text-[12px] text-content-muted">
                  {days} jour{days > 1 ? "s" : ""}
                </span>
                <span className="text-[13px] font-bold text-content-primary">
                  {fmt(totalAmount)}
                </span>
              </div>
            )}

            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Notes
              </label>
              <Textarea name="notes" rows={2} placeholder="Informations complémentaires..." />
            </div>
            <button
              type="submit"
              disabled={submitting || conflict}
              className="btn-gradient rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
