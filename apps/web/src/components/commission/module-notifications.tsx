"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  sent_at: string;
}

export function ModuleNotifications({
  commissionId,
  isReadOnly = false,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadNotifs = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("commission_id", commissionId)
      .order("sent_at", { ascending: false });
    if (data) setNotifs(data);
  }, [commissionId]);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("notifications").insert({
      org_id: user?.user_metadata?.org_id,
      commission_id: commissionId,
      title: title.trim(),
      message: message.trim(),
    });

    setTitle("");
    setMessage("");
    setSubmitting(false);
    loadNotifs();
  }

  return (
    <div className="flex flex-col gap-4">
      {!isReadOnly && (
        <form
          onSubmit={handleSend}
          className="flex flex-col gap-3 rounded-lg bg-surface-elevated p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-content-primary">
            Envoyer une notification
          </p>
          <Input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <Button type="submit" disabled={submitting} className="self-end">
            {submitting ? "Envoi..." : "Envoyer"}
          </Button>
        </form>
      )}

      {notifs.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description="Les notifications de la commission apparaîtront ici"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className="rounded-[14px] bg-surface-secondary px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-content-primary">
                  {n.title}
                </p>
                <span className="text-xs text-content-muted">
                  {new Date(n.sent_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="mt-1 text-sm text-content-secondary">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
