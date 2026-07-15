"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Topbar({ role }: { role: "bureau" | "amicaliste" }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems =
    role === "bureau"
      ? [
          { href: "/bureau/dashboard", label: "Tableau de bord" },
          { href: "/bureau/commissions", label: "Commissions" },
          { href: "/bureau/comptabilite", label: "Comptabilité" },
          { href: "/bureau/membres", label: "Membres" },
          { href: "/bureau/messagerie", label: "Messagerie" },
        ]
      : [
          { href: "/amicaliste/accueil", label: "Accueil" },
          { href: "/amicaliste/evenements", label: "Événements" },
          { href: "/amicaliste/voyages", label: "Voyages" },
          { href: "/amicaliste/commissions", label: "Commissions" },
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-elevated/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={role === "bureau" ? "/bureau/dashboard" : "/amicaliste/accueil"}
          className="text-lg font-bold text-brand-500"
        >
          Amicale
        </Link>

        <nav className="hidden gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </header>
  );
}
