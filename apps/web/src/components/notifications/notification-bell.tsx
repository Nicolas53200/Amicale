"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function NotificationBell({ basePath }: { basePath: string }) {
  const [count, setCount] = useState(0);

  async function loadCount() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!member) return;

    const { count: c } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .or(`target_member_id.eq.${member.id},target_member_id.is.null`)
      .eq("read", false);

    setCount(c ?? 0);
  }

  useEffect(() => {
    loadCount();
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => loadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link
      href={`${basePath}/notifications`}
      className="relative inline-flex items-center justify-center rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
