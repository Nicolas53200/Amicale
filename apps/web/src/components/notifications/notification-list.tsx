"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  sent_at: string;
  commission_id: string | null;
  commissions: { name: string; icon: string | null } | null;
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
      .limit(50);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-content-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-content-muted">
            {unread} non lue{unread > 1 ? "s" : ""}
          </p>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Tout marquer comme lu
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description="Vos notifications apparaîtront ici"
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg bg-surface-elevated shadow-sm">
          {notifications.map((n) => (
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
                {n.commissions?.icon || "🔔"}
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
                    {new Date(n.sent_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-content-muted line-clamp-2">
                  {n.message}
                </p>
                {n.commissions && (
                  <p className="mt-1 text-[10px] text-content-muted">
                    {n.commissions.name}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
