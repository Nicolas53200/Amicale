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
type MsgType = "normal" | "reunion" | "urgence" | "info" | "benevole" | "remboursement";

const MSG_TYPES: { value: MsgType; label: string; icon: string; activeColor: string }[] = [
  { value: "normal", label: "Normal", icon: "💬", activeColor: "bg-brand-500 text-white" },
  { value: "reunion", label: "Réunion", icon: "📋", activeColor: "bg-blue-600 text-white" },
  { value: "urgence", label: "Urgence", icon: "🚨", activeColor: "bg-red-600 text-white" },
  { value: "info", label: "Info", icon: "ℹ️", activeColor: "bg-teal-600 text-white" },
  { value: "benevole", label: "Bénévole", icon: "🤝", activeColor: "bg-purple-600 text-white" },
  { value: "remboursement", label: "Remboursement", icon: "💸", activeColor: "bg-emerald-600 text-white" },
];

const MSG_TYPE_BADGE: Record<MsgType, { icon: string; color: string }> = {
  normal: { icon: "", color: "" },
  reunion: { icon: "📋", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  urgence: { icon: "🚨", color: "bg-red-100 text-red-700 dark:bg-red-900/30" },
  info: { icon: "ℹ️", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30" },
  benevole: { icon: "🤝", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30" },
  remboursement: { icon: "💸", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" },
};

function detectMsgType(subject: string | null): MsgType {
  if (!subject) return "normal";
  if (subject.startsWith("[REUNION]")) return "reunion";
  if (subject.startsWith("[URGENCE]")) return "urgence";
  if (subject.startsWith("[INFO]")) return "info";
  if (subject.startsWith("[BENEVOLE]")) return "benevole";
  if (subject.startsWith("[REMBOURSEMENT]")) return "remboursement";
  return "normal";
}

function stripTypePrefix(subject: string | null): string | null {
  if (!subject) return null;
  return subject.replace(/^\[(REUNION|URGENCE|INFO|BENEVOLE|REMBOURSEMENT)\]\s*/, "");
}

interface RsvpEntry {
  member_id: string;
  first_name: string;
  last_name: string;
  response: string | null; // "present" | "absent" | "incertain" | null (no response)
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
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpRecap, setRsvpRecap] = useState<RsvpEntry[]>([]);
  const [rsvpRecapLoading, setRsvpRecapLoading] = useState(false);

  const [filterType, setFilterType] = useState<MsgType | null>(null);

  // Reunion convocation fields
  const [reunionDate, setReunionDate] = useState("");
  const [reunionTime, setReunionTime] = useState("18:00");
  const [reunionLieu, setReunionLieu] = useState("");

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

  async function loadRsvp(messageId: string) {
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
      .from("meeting_responses")
      .select("response")
      .eq("message_id", messageId)
      .eq("member_id", member.id)
      .maybeSingle();
    setRsvpStatus(data?.response ?? null);
  }

  async function handleRsvp(messageId: string, response: string) {
    setRsvpSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!member) return;
      await supabase.from("meeting_responses").upsert(
        { message_id: messageId, member_id: member.id, response, responded_at: new Date().toISOString() },
        { onConflict: "message_id,member_id" }
      );
      setRsvpStatus(response);
    } finally {
      setRsvpSending(false);
    }
  }

  async function loadRsvpRecap(msg: Message) {
    setRsvpRecapLoading(true);
    setRsvpRecap([]);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!member) return;

      // Fetch all responses for this message_id
      const { data: responses } = await supabase
        .from("meeting_responses")
        .select("member_id, response")
        .eq("message_id", msg.id);

      // Find all recipients of this broadcast reunion:
      // All messages with the same subject, same sender, created within 1 minute of each other
      const { data: broadcastMsgs } = await supabase
        .from("messages")
        .select("to_id")
        .eq("from_id", member.id)
        .eq("subject", msg.subject);

      // Collect unique recipient IDs
      const recipientIds = new Set<string>();
      if (broadcastMsgs) {
        for (const m of broadcastMsgs) {
          if (m.to_id) recipientIds.add(m.to_id);
        }
      }

      if (recipientIds.size === 0) return;

      // Fetch member info for all recipients
      const { data: recipientMembers } = await supabase
        .from("members")
        .select("id, first_name, last_name")
        .in("id", Array.from(recipientIds));

      if (!recipientMembers) return;

      // Build the response map
      const responseMap = new Map<string, string>();
      if (responses) {
        for (const r of responses) {
          responseMap.set(r.member_id, r.response);
        }
      }

      // Also check responses on other copies of the same broadcast message
      // (responses are per message_id, but each recipient has their own message)
      if (broadcastMsgs) {
        const allMsgIds = broadcastMsgs.map(() => msg.id); // We need the IDs of all broadcast copies
        // Actually, we need the IDs of all broadcast messages to check responses on each
        const { data: broadcastMsgsFull } = await supabase
          .from("messages")
          .select("id, to_id")
          .eq("from_id", member.id)
          .eq("subject", msg.subject);

        if (broadcastMsgsFull && broadcastMsgsFull.length > 0) {
          const allIds = broadcastMsgsFull.map((m: { id: string }) => m.id);
          const { data: allResponses } = await supabase
            .from("meeting_responses")
            .select("member_id, response")
            .in("message_id", allIds);
          if (allResponses) {
            for (const r of allResponses) {
              responseMap.set(r.member_id, r.response);
            }
          }
        }
      }

      // Build recap entries
      const entries: RsvpEntry[] = recipientMembers.map((rm) => ({
        member_id: rm.id,
        first_name: rm.first_name,
        last_name: rm.last_name,
        response: responseMap.get(rm.id) ?? null,
      }));

      // Sort: present first, then absent, then incertain, then no response
      const order: Record<string, number> = { present: 0, absent: 1, incertain: 2 };
      entries.sort((a, b) => {
        const oa = a.response ? (order[a.response] ?? 3) : 3;
        const ob = b.response ? (order[b.response] ?? 3) : 3;
        if (oa !== ob) return oa - ob;
        return a.last_name.localeCompare(b.last_name);
      });

      setRsvpRecap(entries);
    } finally {
      setRsvpRecapLoading(false);
    }
  }

  function formatReunionDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function buildReunionBody(rawBody: string): string {
    const dateFmt = formatReunionDate(reunionDate);
    const time = reunionTime || "18:00";
    const lieu = reunionLieu || "";
    if (!rawBody.trim()) {
      return `Réunion prévue le ${dateFmt} à ${time}.\nLieu : ${lieu}\n\nMerci de confirmer votre présence.`;
    }
    return `📅 Réunion le ${dateFmt} à ${time} — ${lieu}\n\n${rawBody}`;
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

    const rawBody = form.get("body") as string;
    const body = msgType === "reunion" && reunionDate
      ? buildReunionBody(rawBody)
      : rawBody;

    await supabase.from("messages").insert({
      org_id: orgId,
      from_id: member.id,
      to_id: form.get("to_id") as string,
      subject: subjectWithType,
      body,
    });

    setSending(false);
    setReplyTo(null);
    setMsgType("normal");
    setReunionDate("");
    setReunionTime("18:00");
    setReunionLieu("");
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
    const rawBody = form.get("body") as string;
    const body = msgType === "reunion" && reunionDate
      ? buildReunionBody(rawBody)
      : rawBody;

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
    setReunionDate("");
    setReunionTime("18:00");
    setReunionLieu("");
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
          {msgType === "reunion" && (
            <div className="flex flex-col gap-3 rounded-[14px] border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-500/10">
              <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">
                Convocation reunion
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de la reunion</label>
                  <Input
                    type="date"
                    value={reunionDate}
                    onChange={(e) => setReunionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Heure</label>
                  <Input
                    type="time"
                    value={reunionTime}
                    onChange={(e) => setReunionTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Lieu</label>
                <Input
                  type="text"
                  value={reunionLieu}
                  onChange={(e) => setReunionLieu(e.target.value)}
                  placeholder="Salle du CIS, visio..."
                  required
                />
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
            <Textarea name="body" rows={4} placeholder={msgType === "reunion" ? "Message supplementaire (optionnel, une convocation sera generee automatiquement)..." : "Votre message..."} required={msgType !== "reunion"} />
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
          {msgType === "reunion" && (
            <div className="flex flex-col gap-3 rounded-[14px] border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-500/10">
              <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">
                Convocation reunion
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de la reunion</label>
                  <Input
                    type="date"
                    value={reunionDate}
                    onChange={(e) => setReunionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-content-secondary">Heure</label>
                  <Input
                    type="time"
                    value={reunionTime}
                    onChange={(e) => setReunionTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Lieu</label>
                <Input
                  type="text"
                  value={reunionLieu}
                  onChange={(e) => setReunionLieu(e.target.value)}
                  placeholder="Salle du CIS, visio..."
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Sujet</label>
            <Input name="subject" placeholder="Objet du message" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Message</label>
            <Textarea name="body" rows={4} placeholder={msgType === "reunion" ? "Message supplementaire (optionnel, une convocation sera generee automatiquement)..." : "Votre message à tous les membres..."} required={msgType !== "reunion"} />
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
          {tab === "inbox" && detectMsgType(selected.subject) === "reunion" && (
            <div className="flex flex-col gap-2 rounded-[14px] border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-500/10">
              <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">
                Votre réponse à cette réunion :
              </p>
              <div className="flex gap-2">
                {([
                  { value: "present", label: "Présent", color: "bg-green-600 text-white" },
                  { value: "absent", label: "Absent", color: "bg-red-600 text-white" },
                  { value: "incertain", label: "Incertain", color: "bg-amber-600 text-white" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleRsvp(selected.id, opt.value)}
                    disabled={rsvpSending}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                      rsvpStatus === opt.value
                        ? opt.color
                        : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "sent" && detectMsgType(selected.subject) === "reunion" && (
            <div className="flex flex-col gap-3 rounded-[14px] border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-500/10">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-blue-700 dark:text-blue-400">
                  Recap des reponses
                </p>
                {!rsvpRecapLoading && rsvpRecap.length > 0 && (() => {
                  const presents = rsvpRecap.filter((r) => r.response === "present").length;
                  const total = rsvpRecap.length;
                  return (
                    <span className="text-[12px] font-medium text-blue-600 dark:text-blue-300">
                      {presents}/{total} presents
                    </span>
                  );
                })()}
              </div>
              {rsvpRecapLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-500">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span className="text-[12px] text-content-muted">Chargement...</span>
                </div>
              ) : rsvpRecap.length === 0 ? (
                <p className="text-[12px] text-content-muted">Aucun destinataire trouve.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Presents */}
                  {rsvpRecap.filter((r) => r.response === "present").length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
                          Presents ({rsvpRecap.filter((r) => r.response === "present").length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rsvpRecap
                          .filter((r) => r.response === "present")
                          .map((r) => (
                            <span
                              key={r.member_id}
                              className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {r.first_name} {r.last_name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Absents */}
                  {rsvpRecap.filter((r) => r.response === "absent").length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-[11px] font-semibold text-red-700 dark:text-red-400">
                          Absents ({rsvpRecap.filter((r) => r.response === "absent").length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rsvpRecap
                          .filter((r) => r.response === "absent")
                          .map((r) => (
                            <span
                              key={r.member_id}
                              className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            >
                              {r.first_name} {r.last_name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Incertains */}
                  {rsvpRecap.filter((r) => r.response === "incertain").length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          Incertains ({rsvpRecap.filter((r) => r.response === "incertain").length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rsvpRecap
                          .filter((r) => r.response === "incertain")
                          .map((r) => (
                            <span
                              key={r.member_id}
                              className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              {r.first_name} {r.last_name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Sans reponse */}
                  {rsvpRecap.filter((r) => r.response === null).length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          Sans reponse ({rsvpRecap.filter((r) => r.response === null).length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rsvpRecap
                          .filter((r) => r.response === null)
                          .map((r) => (
                            <span
                              key={r.member_id}
                              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            >
                              {r.first_name} {r.last_name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
      ) : (() => {
        const FILTER_CHIPS: { value: MsgType | null; label: string; icon?: string; activeColor: string }[] = [
          { value: null, label: "Tous", activeColor: "bg-brand-500 text-white" },
          { value: "reunion", label: "Reunion", icon: "📋", activeColor: "bg-blue-600 text-white" },
          { value: "urgence", label: "Urgence", icon: "🚨", activeColor: "bg-red-600 text-white" },
          { value: "info", label: "Info", icon: "ℹ️", activeColor: "bg-teal-600 text-white" },
          { value: "benevole", label: "Benevole", icon: "🤝", activeColor: "bg-purple-600 text-white" },
          { value: "remboursement", label: "Remboursement", icon: "💸", activeColor: "bg-emerald-600 text-white" },
        ];
        const filteredMessages = filterType
          ? messages.filter((m) => detectMsgType(m.subject) === filterType)
          : messages;
        return (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value ?? "all"}
                type="button"
                onClick={() => setFilterType(chip.value)}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                  filterType === chip.value
                    ? chip.activeColor
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                )}
              >
                {chip.icon && <span>{chip.icon}</span>}
                {chip.label}
              </button>
            ))}
          </div>
          {filteredMessages.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Aucun message"
              description="Aucun message ne correspond au filtre selectionne"
            />
          ) : (
          <div className="flex flex-col divide-y divide-border rounded-[16px] bg-surface-elevated shadow-sm overflow-hidden">
          {filteredMessages.map((msg) => {
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
                    if (detectMsgType(msg.subject) === "reunion") {
                      setRsvpStatus(null);
                      loadRsvp(msg.id);
                      if (tab === "sent") {
                        loadRsvpRecap(msg);
                      }
                    }
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
      })()}
    </div>
  );
}
