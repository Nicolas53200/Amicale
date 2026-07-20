"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  hidden?: boolean;
}

const bureauNav: NavItem[] = [
  { href: "/amicaliste/accueil", label: "Amicaliste", icon: "eye" },
  { href: "/bureau/dashboard", label: "Bureau", icon: "briefcase" },
  { href: "/bureau/messagerie", label: "Messages", icon: "message-circle" },
];

const amicalisteNav: NavItem[] = [
  { href: "/amicaliste/accueil", label: "Accueil", icon: "home" },
  { href: "/amicaliste/commissions", label: "Commissions", icon: "users" },
  { href: "/amicaliste/messagerie", label: "Messages", icon: "message-circle" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 3.13a4 4 0 0 1 0 7.75",
  "message-circle": "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

function NavIcon({ name, active }: { name: string; active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-200"
    >
      {(iconPaths[name] ?? "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}

export function BottomNav({ role }: { role: "bureau" | "amicaliste" }) {
  const pathname = usePathname();
  const [isBureau, setIsBureau] = useState(false);

  useEffect(() => {
    if (role !== "amicaliste") return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("members")
        .select("is_bureau")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.is_bureau) setIsBureau(true);
        });
    });
  }, [role]);

  const baseItems = role === "bureau" ? bureauNav : amicalisteNav;
  const items =
    role === "amicaliste" && isBureau
      ? [...baseItems, { href: "/bureau/dashboard", label: "Bureau", icon: "briefcase" }]
      : baseItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-elevated/92 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]" style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active =
            role === "bureau" && item.href === "/bureau/dashboard"
              ? pathname.startsWith("/bureau")
              : role === "amicaliste" && item.href === "/bureau/dashboard"
                ? false
                : pathname === item.href || (item.href !== "/amicaliste/accueil" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-semibold transition-all duration-200",
                active
                  ? "text-brand-500"
                  : "text-content-muted active:scale-95"
              )}
            >
              <NavIcon name={item.icon} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
