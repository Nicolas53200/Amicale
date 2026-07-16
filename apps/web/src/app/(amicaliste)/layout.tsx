import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AmicalisteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="hidden md:block">
        <Topbar role="amicaliste" />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav role="amicaliste" />
    </div>
  );
}
