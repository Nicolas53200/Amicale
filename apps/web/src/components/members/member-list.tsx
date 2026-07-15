"use client";

import { useState, useMemo } from "react";
import { MemberCard } from "./member-card";
import { ListFilter } from "@/components/ui/list-filter";
import { EmptyState } from "@/components/ui/empty-state";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email: string | null;
  avatar_url: string | null;
  is_bureau: boolean;
  invitation_code: string | null;
}

const tabs = [
  { label: "Tous", value: "all" },
  { label: "Actifs", value: "actif" },
  { label: "Bureau", value: "bureau" },
  { label: "Invités", value: "invite" },
];

export function MemberList({ members }: { members: Member[] }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    let result = members;
    if (tab === "actif") result = result.filter((m) => m.status === "actif");
    else if (tab === "bureau") result = result.filter((m) => m.is_bureau);
    else if (tab === "invite") result = result.filter((m) => m.status === "invite");

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.first_name.toLowerCase().includes(q) ||
          m.last_name.toLowerCase().includes(q) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          m.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [members, search, tab]);

  return (
    <div className="flex flex-col gap-3">
      <ListFilter
        searchPlaceholder="Rechercher un membre..."
        tabs={tabs}
        activeTab={tab}
        onSearchChange={setSearch}
        onTabChange={setTab}
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Aucun résultat"
          description={search ? "Essayez un autre terme de recherche" : "Aucun membre dans cette catégorie"}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-content-muted">
            {filtered.length} membre{filtered.length > 1 ? "s" : ""}
          </p>
          {filtered.map((m) => (
            <div key={m.id} className="animate-fade-in">
              <MemberCard
                firstName={m.first_name}
                lastName={m.last_name}
                role={m.role}
                status={m.status}
                email={m.email}
                avatarUrl={m.avatar_url}
                isBureau={m.is_bureau}
                invitationCode={m.invitation_code}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
