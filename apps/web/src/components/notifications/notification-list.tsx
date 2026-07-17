"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  sent_at: string;
  type: string | null;
  commission_id: string | null;
  commissions: { name: string; icon: string | null } | null;
}

type Filter = "all" | "unread" | "events" | "commissions";

const filterConfig: { id: Filter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "unread", label: "Non lues" },
  { id: "events", label: "Événements" },
  { id: "commissions", label: "Commissions" },
];

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!member) { setLoading(false); return; }

    const { data } = await supabase
      .from("notifications")
      .select("*, commissions:commission_id(name, icon)")
      .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
      .order("sent_at", { ascending: false })
      .limit(100);

    setNotifications((data as unknown as Notification[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!member) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unread = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    switch (filter) {
      case "unread": return !n.read;
      case "events": return n.type === "event" || n.type === "reunion";
      case "commissions": return !!n.commission_id;
      default: return true;
    }
  });

  function groupByDate(items: Notification[]) {
    const today = new Date();
    const todayStr = today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const groups: { label: string; items: Notification[] }[] = [];
    let currentLabel = "";
    let currentItems: Notification[] = [];

    for (const item of items) {
      const dateStr = new Date(item.sent_at).toDateString();
      let label: string;
      if (dateStr === todayStr) label = "Aujourd'hui";
      else if (dateStr === yesterdayStr) label = "Hier";
      else label = new Date(item.sent_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

      if (label !== currentLabel) {
        if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
        currentLabel = label;
        currentItems = [item];
      } else {
        currentItems.push(item);
      }
    }
    if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
    return groups;
  }

  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-content-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex gap-1 rounded-[14px] bg-surface-secondary p-1">
        {filterConfig.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-1 rounded-[12px] px-2 py-1.5 text-[12px] font-semibold transition-colors",
              filter === f.id
                ? "bg-surface-elevated text-content-primary shadow-sm"
                : "text-content-muted hover:text-content-secondary"
            )}
          >
            {f.label}
            {f.id === "unread" && unread > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {unread > 0 && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={markAllRead}
            className="text-[12px] font-semibold text-brand-500"
          >
            Tout marquer comme lu
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title={filter === "unread" ? "Tout est lu" : "Aucune notification"}
          description={filter === "unread" ? "Vous êtes à jour !" : "Vos notifications apparaîtront ici"}
        />
      ) : (
        grouped.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">
              {group.label}
            </p>
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-surface-elevated shadow-sm">
              {group.items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-secondary",
                    !n.read && "bg-brand-50/50 dark:bg-brand-500/5"
                  )}
                >
                  <span className="mt-0.5 text-lg">
                    {n.commissions?.icon || (n.type === "event" ? "📅" : n.type === "reunion" ? "📋" : "🔔")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm",
                          !n.read
                            ? "font-semibold text-content-primary"
                            : "text-content-secondary"
                        )}
                      >
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                      )}
                      <span className="ml-auto shrink-0 text-xs text-content-muted">
                        {new Date(n.sent_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-content-muted line-clamp-2">
                      {n.message}
                    </p>
                    {n.commissions && (
                      <span className="mt-1 inline-block rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-content-muted">
                        {n.commissions.icon} {n.commissions.name}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
