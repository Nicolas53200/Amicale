import { Inbox } from "@/components/messages/inbox";

export default function MessageriePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Messagerie</h1>
        <p className="text-sm text-content-secondary">
          Échangez avec les membres de votre amicale
        </p>
      </div>
      <Inbox />
    </div>
  );
}
