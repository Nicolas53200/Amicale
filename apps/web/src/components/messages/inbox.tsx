"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  sender?: { first_name: string; last_name: string; avatar_url: string | null } | null;
  recipient?: { first_name: string; last_name: string; avatar_url: string | null } | null;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
}

export function Inbox() {
  const [tab, setTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [sending, setSending] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!member) return;

    if (tab === "inbox") {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:from_id(first_name, last_name, avatar_url)")
        .eq("to_id", member.id)
        .order("created_at", { ascending: false });
      setMessages((data as Message[]) ?? []);
    } else if (tab === "sent") {
      const { data } = await supabase
        .from("messages")
        .select("*, recipient:to_id(first_name, last_name, avatar_url)")
        .eq("from_id", member.id)
        .order("created_at", { ascending: false });
      setMessages((data as Message[]) ?? []);
    } else {
      const { data } = await supabase
        .from("members")
        .select("id, first_name, last_name")
        .neq("id", member.id)
        .order("last_name");
      setMembers((data as Member[]) ?? []);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function markAsRead(msg: Message) {
    if (msg.read_at) return;
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", msg.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m))
    );
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!member) return;

    const orgId = user.user_metadata?.org_id;

    await supabase.from("messages").insert({
      org_id: orgId,
      from_id: member.id,
      to_id: form.get("to_id") as string,
      subject: (form.get("subject") as string) || null,
      body: form.get("body") as string,
    });

    setSending(false);
    setTab("sent");
  }

  const unread = messages.filter((m) => !m.read_at).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-[14px] bg-surface-secondary p-1">
        {(["inbox", "sent", "compose"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setSelected(null); }}
            className={cn(
              "flex-1 rounded-[12px] px-3 py-1.5 text-[12px] font-semibold transition-colors",
              tab === t
                ? "bg-surface-elevated text-content-primary shadow-sm"
                : "text-content-muted hover:text-content-secondary"
            )}
          >
            {t === "inbox" && `Reçus${unread > 0 ? ` (${unread})` : ""}`}
            {t === "sent" && "Envoyés"}
            {t === "compose" && "Nouveau"}
          </button>
        ))}
      </div>

      {tab === "compose" ? (
        <form onSubmit={handleSend} className="flex flex-col gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Destinataire</label>
            <select
              name="to_id"
              required
              className="w-full rounded-[14px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary"
            >
              <option value="">Sélectionner un membre</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Sujet</label>
            <Input name="subject" placeholder="Objet du message" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Message</label>
            <Textarea name="body" required rows={4} placeholder="Votre message..." />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="btn-gradient self-end rounded-[14px] px-6 py-2.5 text-[13px] font-semibold text-white"
          >
            {sending ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      ) : selected ? (
        <div className="flex flex-col gap-4 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="self-start text-[13px] font-semibold text-brand-500"
          >
            ← Retour
          </button>
          <div className="flex items-center gap-3">
            <Avatar
              name={
                tab === "inbox"
                  ? `${selected.sender?.first_name} ${selected.sender?.last_name}`
                  : `${selected.recipient?.first_name} ${selected.recipient?.last_name}`
              }
              size="md"
            />
            <div>
              <p className="text-sm font-semibold text-content-primary">
                {tab === "inbox"
                  ? `${selected.sender?.first_name} ${selected.sender?.last_name}`
                  : `${selected.recipient?.first_name} ${selected.recipient?.last_name}`}
              </p>
              <p className="text-xs text-content-muted">
                {new Date(selected.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {selected.subject && (
            <h3 className="text-base font-semibold text-content-primary">
              {selected.subject}
            </h3>
          )}
          <p className="whitespace-pre-wrap text-sm text-content-secondary">
            {selected.body}
          </p>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon="💬"
          title={tab === "inbox" ? "Aucun message reçu" : "Aucun message envoyé"}
          description={
            tab === "inbox"
              ? "Vos messages apparaîtront ici"
              : "Les messages que vous envoyez apparaîtront ici"
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-[16px] bg-surface-elevated shadow-sm overflow-hidden">
          {messages.map((msg) => {
            const person = tab === "inbox" ? msg.sender : msg.recipient;
            return (
              <button
                key={msg.id}
                type="button"
                onClick={() => {
                  setSelected(msg);
                  if (tab === "inbox") markAsRead(msg);
                }}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-secondary",
                  tab === "inbox" && !msg.read_at && "bg-brand-50/50 dark:bg-brand-500/5"
                )}
              >
                <Avatar
                  name={`${person?.first_name} ${person?.last_name}`}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("truncate text-sm", !msg.read_at && tab === "inbox" ? "font-semibold text-content-primary" : "text-content-secondary")}>
                      {person?.first_name} {person?.last_name}
                    </span>
                    {tab === "inbox" && !msg.read_at && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                    <span className="ml-auto shrink-0 text-xs text-content-muted">
                      {new Date(msg.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {msg.subject && (
                    <p className="truncate text-sm text-content-primary">{msg.subject}</p>
                  )}
                  <p className="truncate text-xs text-content-muted">{msg.body}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
