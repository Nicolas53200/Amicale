import { GradientHeader } from "@/components/layout/gradient-header";
import { Inbox } from "@/components/messages/inbox";

export default function MessageriePage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Messagerie"
        subtitle="Échangez avec les membres"
        backHref="/bureau/dashboard"
      />
      <Inbox isBureau />
    </div>
  );
}
