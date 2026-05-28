import { useEffect, useState } from "react";
import type { Notification } from "../../../shared/src/types/notification";
import { formatRelativeTime } from "../../../shared/src/utils/date";
import { getNotifications } from "../services/notification.service";
import { Loader2 } from "lucide-react";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Gagal memuat notifikasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-ig-primary animate-spin" />
        <p className="text-ig-secondary-text text-xs font-medium tracking-wide animate-pulse">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-6">
      <h1 className="text-ig-text text-xl font-bold mb-6 tracking-wide">Notifikasi</h1>
      
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-neutral-500 text-sm">Belum ada notifikasi.</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-900">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notif={notif} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationItem({ notif }: { notif: Notification }) {
  // Ambil huruf pertama dari pesan atau default "U" sebagai fallback inisial avatar
  const initial = notif.message ? notif.message.charAt(0).toUpperCase() : "U";

  return (
    <li className="flex items-center gap-4 py-3 hover:bg-ig-secondary-bg/20 px-2 rounded-lg transition-colors group">
      {/* Avatar bulat dengan inisial */}
      <div className="w-11 h-11 rounded-full bg-ig-secondary-bg border border-neutral-800 flex items-center justify-center text-ig-text text-sm font-semibold flex-shrink-0 shadow-sm">
        {initial}
      </div>
      
      {/* Pesan notifikasi & Waktu */}
      <div className="flex-1 min-w-0">
        <p className="text-ig-text text-sm leading-snug break-words">
          {notif.message}
          <span className="text-neutral-500 text-xs ml-2 inline-block">
            {formatRelativeTime(notif.createdAt)}
          </span>
        </p>
      </div>
      
      {/* Titik biru penanda belum dibaca */}
      {!notif.isRead && (
        <div className="w-2.5 h-2.5 rounded-full bg-ig-primary flex-shrink-0 animate-pulse" />
      )}
    </li>
  );
}