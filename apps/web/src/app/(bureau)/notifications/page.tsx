import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Notifications
        </h1>
        <p className="text-sm text-content-secondary">
          Notifications de votre amicale
        </p>
      </div>
      <NotificationList />
    </div>
  );
}
