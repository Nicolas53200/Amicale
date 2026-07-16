import { GradientHeader } from "@/components/layout/gradient-header";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Notifications"
        subtitle="Notifications de votre amicale"
      />
      <NotificationList />
    </div>
  );
}
