import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function BureauLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <Topbar role="bureau" />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav role="bureau" />
    </div>
  );
}
