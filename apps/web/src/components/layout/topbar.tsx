"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/layout/search-dialog";

export function Topbar({ role }: { role: "bureau" | "amicaliste" }) {
  const router = useRouter();
  const basePath = role === "bureau" ? "/bureau" : "/amicaliste";
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const bureauNavItems = [
    { href: "/bureau/dashboard", label: "Tableau de bord" },
    { href: "/bureau/evenements", label: "Événements" },
    { href: "/bureau/voyages", label: "Voyages" },
    { href: "/bureau/locations", label: "Locations" },
    { href: "/bureau/commissions", label: "Commissions" },
    { href: "/bureau/comptabilite", label: "Comptabilité" },
    { href: "/bureau/membres", label: "Membres" },
    { href: "/bureau/messagerie", label: "Messages" },
  ];

  const amicalisteNavItems = [
    { href: "/amicaliste/accueil", label: "Accueil" },
    { href: "/amicaliste/evenements", label: "Événements" },
    { href: "/amicaliste/voyages", label: "Voyages" },
    { href: "/amicaliste/calendrier", label: "Calendrier" },
    { href: "/amicaliste/locations", label: "Locations" },
    { href: "/amicaliste/commissions", label: "Commissions" },
    { href: "/amicaliste/messagerie", label: "Messages" },
  ];

  const navItems = role === "bureau" ? bureauNavItems : amicalisteNavItems;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-elevated/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            href={role === "bureau" ? "/bureau/dashboard" : "/amicaliste/accueil"}
            className="text-lg font-bold text-brand-500"
          >
            Amicale
          </Link>
          {role === "bureau" ? (
            <Link
              href="/amicaliste/accueil"
              className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Vue Amicaliste
            </Link>
          ) : isBureau ? (
            <Link
              href="/bureau/dashboard"
              className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              Bureau
            </Link>
          ) : null}
        </div>

        <nav className="hidden gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[14px] px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <SearchDialog basePath={basePath} />
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell basePath={basePath} />
          <Link
            href={`${basePath}/profil`}
            className="rounded-[14px] p-2 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          {role === "bureau" && (
            <Link
              href="/bureau/parametres"
              className="hidden rounded-[14px] p-2 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary sm:block"
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:inline-flex"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
