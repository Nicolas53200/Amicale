import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function BureauLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="md:hidden">
        <Topbar role="bureau" />
      </div>
      <div className="flex min-h-screen">
        <Sidebar role="bureau" />
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav role="bureau" />
    </div>
  );
}
