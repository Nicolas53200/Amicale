"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import {
  addCommissionMember,
  removeCommissionMember,
} from "@/lib/actions/commissions";

interface CommMember {
  id: string;
  role: string;
  member_id: string;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
  };
}

interface OrgMember {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

export function ModuleMembres({
  commissionId,
  isReadOnly = false,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [members, setMembers] = useState<CommMember[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("membre");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("commission_members")
      .select(
        "id, role, member_id, members:member_id(id, first_name, last_name, avatar_url, role)"
      )
      .eq("commission_id", commissionId);
    if (data) setMembers(data as unknown as CommMember[]);
  }, [commissionId]);

  const loadOrgMembers = useCallback(async () => {
    if (isReadOnly) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("members")
      .select("id, first_name, last_name, avatar_url, role")
      .order("last_name", { ascending: true });
    if (data) setOrgMembers(data);
  }, [isReadOnly]);

  useEffect(() => {
    loadMembers();
    loadOrgMembers();
  }, [loadMembers, loadOrgMembers]);

  const availableMembers = orgMembers.filter(
    (om) => !members.some((cm) => cm.member_id === om.id)
  );

  async function handleAdd() {
    if (!selectedMemberId) return;
    setAdding(true);
    try {
      await addCommissionMember(commissionId, selectedMemberId, selectedRole);
      setSelectedMemberId("");
      setSelectedRole("membre");
      await loadMembers();
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(memberId: string) {
    setRemovingId(memberId);
    try {
      await removeCommissionMember(commissionId, memberId);
      await loadMembers();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!isReadOnly && (
        <div className="rounded-[14px] border border-border bg-surface-secondary p-3">
          <p className="mb-2 text-[12px] font-semibold text-content-primary">
            Ajouter un membre
          </p>
          <div className="flex flex-col gap-2">
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="h-10 w-full rounded-[14px] border border-border bg-surface-primary px-3 text-[13px] text-content-primary"
            >
              <option value="">Choisir un membre...</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-10 flex-1 rounded-[14px] border border-border bg-surface-primary px-3 text-[13px] text-content-primary"
              >
                <option value="membre">Membre</option>
                <option value="responsable">Responsable</option>
              </select>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedMemberId || adding}
                className="btn-gradient h-10 rounded-full px-4 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {adding ? "..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[12px] font-medium text-content-muted">
        {members.length} membre{members.length !== 1 ? "s" : ""}
      </p>

      {members.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Aucun membre"
          description="Ajoutez des membres à cette commission"
        />
      ) : (
        members.map((cm) => (
          <div
            key={cm.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-3"
          >
            <Avatar
              name={`${cm.members.first_name} ${cm.members.last_name}`}
              src={cm.members.avatar_url}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-content-primary">
                {cm.members.first_name} {cm.members.last_name}
              </p>
              <p className="text-xs capitalize text-content-muted">
                {cm.members.role}
              </p>
            </div>
            <Badge variant={cm.role === "responsable" ? "default" : "neutral"}>
              {cm.role}
            </Badge>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => handleRemove(cm.member_id)}
                disabled={removingId === cm.member_id}
                className="rounded-full bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
              >
                {removingId === cm.member_id ? "..." : "Retirer"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
