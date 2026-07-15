import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AmicalisteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="md:hidden">
        <Topbar role="amicaliste" />
      </div>
      <div className="flex min-h-screen">
        <Sidebar role="amicaliste" />
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-6">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
      <BottomNav role="amicaliste" />
    </div>
  );
}
