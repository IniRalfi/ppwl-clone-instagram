import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`);
        const json = await res.json();
        
        if (res.ok && json.data) {
          setNotifications(json.data);
        } else {
          toast.error("Gagal memuat notifikasi.");
        }
      } catch (error) {
        toast.error("Kesalahan jaringan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500 fill-current" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500 fill-current" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-ig-primary" />;
      default:
        return <Heart className="h-5 w-5 text-ig-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex justify-center pb-20 pt-6 px-4">
      <div className="w-full max-w-[600px] flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Notifikasi</h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-ig-secondary-text">
            Memuat notifikasi...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-ig-secondary-text py-20">
            Belum ada notifikasi.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notif) => {
              const timeAgo = new Date(notif.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
              
              return (
                <div 
                  key={notif.id} 
                  className={`flex items-start gap-4 p-4 rounded-xl border ${notif.isRead ? 'border-transparent bg-transparent' : 'border-ig-border bg-neutral-900'}`}
                >
                  <div className="mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] leading-tight">
                      {notif.message}
                    </p>
                    <span className="text-[12px] text-ig-secondary-text mt-1 block">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
