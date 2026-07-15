"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";

interface CommMember {
  id: string;
  role: string;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
  };
}

export function ModuleMembres({
  commissionId,
  isReadOnly = false,
}: {
  commissionId: string;
  isReadOnly?: boolean;
}) {
  const [members, setMembers] = useState<CommMember[]>([]);

  const loadMembers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("commission_members")
      .select("id, role, members:member_id(id, first_name, last_name, avatar_url, role)")
      .eq("commission_id", commissionId);
    if (data) setMembers(data as unknown as CommMember[]);
  }, [commissionId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (members.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="Aucun membre"
        description="Ajoutez des membres à cette commission"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((cm) => (
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
        </div>
      ))}
    </div>
  );
}
