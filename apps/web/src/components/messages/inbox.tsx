"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrgIdClient } from "@/lib/auth-client";
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
  sender?: { id: string; first_name: string; last_name: string; avatar_url: string | null } | null;
  recipient?: { first_name: string; last_name: string; avatar_url: string | null } | null;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
}

type Tab = "inbox" | "sent" | "compose" | "broadcast";
type MsgType = "normal" | "reunion" | "urgence" | "info";

const MSG_TYPES: { value: MsgType; label: string; icon: string; activeColor: string }[] = [
  { value: "normal", label: "Normal", icon: "💬", activeColor: "bg-brand-500 text-white" },
  { value: "reunion", label: "Réunion", icon: "📋", activeColor: "bg-blue-600 text-white" },
  { value: "urgence", label: "Urgence", icon: "🚨", activeColor: "bg-red-600 text-white" },
  { value: "info", label: "Info", icon: "ℹ️", activeColor: "bg-teal-600 text-white" },
];

const MSG_TYPE_BADGE: Record<MsgType, { icon: string; color: string }> = {
  normal: { icon: "", color: "" },
  reunion: { icon: "📋", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  urgence: { icon: "🚨", color: "bg-red-100 text-red-700 dark:bg-red-900/30" },
  info: { icon: "ℹ️", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30" },
};

function detectMsgType(subject: string | null): MsgType {
  if (!subject) return "normal";
  if (subject.startsWith("[REUNION]")) return "reunion";
  if (subject.startsWith("[URGENCE]")) return "urgence";
  if (subject.startsWith("[INFO]")) return "info";
  return "normal";
}

function stripTypePrefix(subject: string | null): string | null {
  if (!subject) return null;
  return subject.replace(/^\[(REUNION|URGENCE|INFO)\]\s*/, "");
}

interface InboxProps {
  isBureau?: boolean;
}

export function Inbox({ isBureau = false }: InboxProps) {
  const [tab, setTab] = useState<Tab>("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<MsgType>("normal");

  // For reply pre-fill
  const [replyTo, setReplyTo] = useState<{ recipientId: string; subject: string } | null>(null);
  const composeFormRef = useRef<HTMLFormElement>(null);

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
        .select("*, sender:from_id(id, first_name, last_name, avatar_url)")
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
    } else if (tab === "compose" || tab === "broadcast") {
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

    const orgId = await getOrgIdClient();

    const rawSubject = (form.get("subject") as string) || "";
    const subjectWithType = msgType !== "normal" && rawSubject
      ? `[${msgType.toUpperCase()}] ${rawSubject}`
      : rawSubject || null;

    await supabase.from("messages").insert({
      org_id: orgId,
      from_id: member.id,
      to_id: form.get("to_id") as string,
      subject: subjectWithType,
      body: form.get("body") as string,
    });

    setSending(false);
    setReplyTo(null);
    setMsgType("normal");
    setTab("sent");
  }

  async function handleBroadcast(e: React.FormEvent<HTMLFormElement>) {
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

    const orgId = await getOrgIdClient();
    const rawSubject = (form.get("subject") as string) || "";
    const subject = msgType !== "normal" && rawSubject
      ? `[${msgType.toUpperCase()}] ${rawSubject}`
      : rawSubject || null;
    const body = form.get("body") as string;

    const inserts = members.map((m) => ({
      org_id: orgId,
      from_id: member.id,
      to_id: m.id,
      subject,
      body,
    }));

    if (inserts.length > 0) {
      await supabase.from("messages").insert(inserts);
    }

    setSending(false);
    setMsgType("normal");
    setTab("sent");
  }

  async function handleDelete(msgId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(msgId);
    const supabase = createClient();
    await supabase.from("messages").delete().eq("id", msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setDeleting(null);
  }

  function handleReply(msg: Message) {
    if (!msg.sender?.id) {
      // Fallback: switch to compose without pre-fill
      setTab("compose");
      return;
    }
    const reSubject = msg.subject
      ? msg.subject.startsWith("RE: ") ? msg.subject : `RE: ${msg.subject}`
      : "";
    setReplyTo({ recipientId: msg.sender.id, subject: reSubject });
    setSelected(null);
    setTab("compose");
  }

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!member) return;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("to_id", member.id)
        .is("read_at", null);
      setUnreadCount(count ?? 0);
    }
    fetchUnread();
  }, [tab, messages]);

  const tabs: Tab[] = isBureau
    ? ["inbox", "sent", "compose", "broadcast"]
    : ["inbox", "sent", "compose"];

  const tabLabels: Record<Tab, string> = {
    inbox: `Reçus${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
    sent: "Envoyés",
    compose: "Nouveau",
    broadcast: "Diffusion",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-[14px] bg-surface-secondary p-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setSelected(null); if (t !== "compose") setReplyTo(null); }}
            className={cn(
              "flex-1 rounded-[12px] px-3 py-1.5 text-[12px] font-semibold transition-colors",
              tab === t
                ? "bg-surface-elevated text-content-primary shadow-sm"
                : "text-content-muted hover:text-content-secondary"
            )}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === "compose" ? (
        <form
          ref={composeFormRef}
          onSubmit={handleSend}
          className="flex flex-col gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Destinataire</label>
            <select
              name="to_id"
              required
              defaultValue={replyTo?.recipientId ?? ""}
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
          {isBureau && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Type de message</label>
              <div className="flex gap-2">
                {MSG_TYPES.map((mt) => (
                  <button key={mt.value} type="button" onClick={() => setMsgType(mt.value)}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                      msgType === mt.value ? mt.activeColor : "bg-surface-secondary text-content-secondary")}>
                    <span>{mt.icon}</span>{mt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Sujet</label>
            <Input
              name="subject"
              placeholder="Objet du message"
              defaultValue={replyTo?.subject ?? ""}
            />
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
      ) : tab === "broadcast" ? (
        <form
          onSubmit={handleBroadcast}
          className="flex flex-col gap-3 rounded-[16px] bg-surface-elevated p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 rounded-[12px] bg-brand-50 px-3 py-2 dark:bg-brand-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/>
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>
            </svg>
            <span className="text-[12px] font-medium text-brand-600 dark:text-brand-400">
              Ce message sera envoyé à tous les membres ({members.length})
            </span>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Type de message</label>
            <div className="flex gap-2">
              {MSG_TYPES.map((mt) => (
                <button key={mt.value} type="button" onClick={() => setMsgType(mt.value)}
                  className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                    msgType === mt.value ? mt.activeColor : "bg-surface-secondary text-content-secondary")}>
                  <span>{mt.icon}</span>{mt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Sujet</label>
            <Input name="subject" placeholder="Objet du message" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Message</label>
            <Textarea name="body" required rows={4} placeholder="Votre message à tous les membres..." />
          </div>
          <button
            type="submit"
            disabled={sending || members.length === 0}
            className="btn-gradient self-end rounded-[14px] px-6 py-2.5 text-[13px] font-semibold text-white"
          >
            {sending ? "Envoi..." : `Envoyer à tous (${members.length})`}
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
          {selected.subject && (() => {
            const dt = detectMsgType(selected.subject);
            const db = MSG_TYPE_BADGE[dt];
            return (
              <div className="flex items-center gap-2">
                {dt !== "normal" && db.icon && (
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", db.color)}>
                    {db.icon} {dt === "reunion" ? "Réunion" : dt === "urgence" ? "Urgence" : "Info"}
                  </span>
                )}
                <h3 className="text-base font-semibold text-content-primary">
                  {stripTypePrefix(selected.subject)}
                </h3>
              </div>
            );
          })()}
          <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-content-secondary">
            {selected.body}
          </div>
          {tab === "inbox" && (
            <button
              type="button"
              onClick={() => handleReply(selected)}
              className="inline-flex items-center gap-2 self-start rounded-[14px] border border-border px-4 py-2 text-[13px] font-semibold text-brand-500 transition-colors hover:bg-surface-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 17 4 12 9 7"/>
                <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
              </svg>
              Répondre
            </button>
          )}
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
            const mType = detectMsgType(msg.subject);
            const badge = MSG_TYPE_BADGE[mType];
            const cleanSubject = stripTypePrefix(msg.subject);
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-secondary",
                  tab === "inbox" && !msg.read_at && "bg-brand-50/50 dark:bg-brand-500/5",
                  mType === "urgence" && "border-l-2 border-l-red-500"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelected(msg);
                    if (tab === "inbox") markAsRead(msg);
                  }}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
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
                      {mType !== "normal" && badge.icon && (
                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold", badge.color)}>
                          {badge.icon}
                        </span>
                      )}
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
                    {cleanSubject && (
                      <p className="truncate text-sm text-content-primary">{cleanSubject}</p>
                    )}
                    <p className="truncate text-xs text-content-muted">{msg.body}</p>
                  </div>
                </button>
                {tab === "sent" && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(msg.id, e)}
                    disabled={deleting === msg.id}
                    className="mt-1 shrink-0 rounded-[8px] p-1.5 text-content-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    title="Supprimer"
                  >
                    {deleting === msg.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
