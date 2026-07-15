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
  { href: "/bureau/evenements", label: "Événements", icon: "calendar" },
  { href: "/bureau/locations", label: "Locations", icon: "key" },
  { href: "/bureau/membres", label: "Membres", icon: "users" },
  { href: "/bureau/messagerie", label: "Messages", icon: "mail" },
];

const amicalisteNav: NavItem[] = [
  { href: "/amicaliste/accueil", label: "Accueil", icon: "home" },
  { href: "/amicaliste/evenements", label: "Événements", icon: "calendar" },
  { href: "/amicaliste/locations", label: "Locations", icon: "key" },
  { href: "/amicaliste/voyages", label: "Voyages", icon: "map-pin" },
  { href: "/amicaliste/messagerie", label: "Messages", icon: "mail" },
];

const iconPaths: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 3.13a4 4 0 0 1 0 7.75",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
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
  const items = role === "bureau" ? bureauNav : amicalisteNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface-elevated/95 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-all duration-200",
                active
                  ? "text-brand-500"
                  : "text-content-muted active:scale-95"
              )}
            >
              {active && (
                <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-500" />
              )}
              <NavIcon name={item.icon} active={active} />
              <span className={cn(active && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
