"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const typeLabels: Record<string, string> = {
  appartement: "Appartement",
  barnum: "Barnum",
  remorque: "Remorque",
  camping: "Camping-car",
};

interface Asset {
  id: string;
  name: string;
  type: string;
  daily_rate: number;
  deposit: number;
  asset_bookings: { count: number }[];
}

export function ModuleLocations({
  commissionId,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("assets")
        .select("id, name, type, daily_rate, deposit, asset_bookings(count)")
        .eq("commission_id", commissionId);
      setAssets((data as Asset[]) ?? []);
      setLoading(false);
    }
    load();
  }, [commissionId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-[12px] bg-surface-secondary" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <EmptyState
        icon="🏠"
        title="Aucun bien"
        description="Les biens locatifs de cette commission apparaitront ici"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {assets.map((asset) => {
        const bookings = asset.asset_bookings[0]?.count ?? 0;
        return (
          <Link
            key={asset.id}
            href={`/amicaliste/locations/${asset.id}`}
            className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors hover:bg-surface-primary"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
              <span className="text-lg">🏠</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-content-primary">{asset.name}</p>
              <p className="text-[11px] text-content-muted">
                {typeLabels[asset.type] || asset.type}
                {" · "}
                {bookings} reservation{bookings > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-semibold text-brand-600">{fmt(asset.daily_rate)}/j</span>
              {asset.deposit > 0 && (
                <Badge variant="neutral">Caution {fmt(asset.deposit)}</Badge>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
