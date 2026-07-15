"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
}

const bureauItems: SidebarItem[] = [
  { href: "/bureau/dashboard", label: "Tableau de bord", icon: "home" },
  { href: "/bureau/evenements", label: "Événements", icon: "calendar" },
  { href: "/bureau/voyages", label: "Voyages", icon: "map-pin" },
  { href: "/bureau/locations", label: "Locations", icon: "key" },
  { href: "/bureau/commissions", label: "Commissions", icon: "grid" },
  { href: "/bureau/comptabilite", label: "Comptabilité", icon: "receipt" },
  { href: "/bureau/membres", label: "Membres", icon: "users" },
  { href: "/bureau/messagerie", label: "Messages", icon: "mail" },
];

const amicalisteItems: SidebarItem[] = [
  { href: "/amicaliste/accueil", label: "Accueil", icon: "home" },
  { href: "/amicaliste/evenements", label: "Événements", icon: "calendar" },
  { href: "/amicaliste/voyages", label: "Voyages", icon: "map-pin" },
  { href: "/amicaliste/locations", label: "Locations", icon: "key" },
  { href: "/amicaliste/commissions", label: "Commissions", icon: "grid" },
  { href: "/amicaliste/messagerie", label: "Messages", icon: "mail" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  receipt: "M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2z M8 10h8 M8 14h4",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 3.13a4 4 0 0 1 0 7.75",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings: "M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

function SidebarIcon({ name }: { name: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {(iconPaths[name] ?? "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}

export function Sidebar({ role }: { role: "bureau" | "amicaliste" }) {
  const pathname = usePathname();
  const items = role === "bureau" ? bureauItems : amicalisteItems;

  return (
    <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r border-border bg-surface-elevated">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link
          href={role === "bureau" ? "/bureau/dashboard" : "/amicaliste/accueil"}
          className="text-lg font-bold text-brand-500"
        >
          Amicale
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-content-secondary hover:bg-surface-secondary hover:text-content-primary"
                  )}
                >
                  <SidebarIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <Link
            href={`${role === "bureau" ? "/bureau" : "/amicaliste"}/profil`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
          >
            <SidebarIcon name="user" />
            Mon profil
          </Link>
          {role === "bureau" && (
            <Link
              href="/bureau/parametres"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
            >
              <SidebarIcon name="settings" />
              Paramètres
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
