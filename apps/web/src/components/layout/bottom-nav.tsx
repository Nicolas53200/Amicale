"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const bureauNav: NavItem[] = [
  { href: "/bureau/dashboard", label: "Accueil", icon: "home" },
  { href: "/bureau/commissions", label: "Commissions", icon: "grid" },
  { href: "/bureau/comptabilite", label: "Compta", icon: "receipt" },
  { href: "/bureau/membres", label: "Membres", icon: "users" },
  { href: "/bureau/messagerie", label: "Messages", icon: "mail" },
];

const amicalisteNav: NavItem[] = [
  { href: "/amicaliste/accueil", label: "Accueil", icon: "home" },
  { href: "/amicaliste/evenements", label: "Événements", icon: "calendar" },
  { href: "/amicaliste/voyages", label: "Voyages", icon: "map-pin" },
  { href: "/amicaliste/commissions", label: "Commissions", icon: "grid" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  receipt: "M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2z M8 10h8 M8 14h4",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 3.13a4 4 0 0 1 0 7.75",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

function NavIcon({ name }: { name: string }) {
  return (
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
      {(iconPaths[name] ?? "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}

export function BottomNav({ role }: { role: "bureau" | "amicaliste" }) {
  const pathname = usePathname();
  const items = role === "bureau" ? bureauNav : amicalisteNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface-elevated/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-brand-500"
                  : "text-content-muted hover:text-content-secondary"
              )}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
