import { useEffect, useState, useRef } from "react";
import type { Notification } from "../../../../shared/src/types/notification";
import { apiClient } from "../../services/api.client";
import { useAuthStore } from "../../store/auth.store";
import { useNotificationDrawerStore } from "../../store/notification-drawer.store";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function formatNotifTime(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${Math.max(1, diffMins)}m`;
  } else if (diffHours < 24) {
    return `${diffHours}j`;
  } else if (diffDays < 7) {
    return `${diffDays}h`;
  } else {
    return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
  }
}

function groupNotifications(notifs: Notification[]) {
  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const thisMonth: Notification[] = [];
  const older: Notification[] = [];

  const now = new Date();

  notifs.forEach((notif) => {
    const created = new Date(notif.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      today.push(notif);
    } else if (diffDays <= 7) {
      thisWeek.push(notif);
    } else if (diffDays <= 30) {
      thisMonth.push(notif);
    } else {
      older.push(notif);
    }
  });

  return { today, thisWeek, thisMonth, older };
}

export function NotificationDrawer() {
  const { isOpen, setIsOpen } = useNotificationDrawerStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following' | 'comments' | 'follows'>('all');
  const { user } = useAuthStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get<{ data: Notification[] }>("/notifications");
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close drawer on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on sidebar or bottomnav
      const target = event.target as HTMLElement;
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(target) &&
        !target.closest(".left-sidebar") &&
        !target.closest("nav")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleFollowToggle = async (notifId: string, isNowFollowing: boolean) => {
    const targetNotif = notifications.find((n) => n.id === notifId);
    if (!targetNotif || !targetNotif.refId || !user) return;

    try {
      if (isNowFollowing) {
        await apiClient.post("/follow", {
          followerId: user.id,
          followingId: targetNotif.refId,
        });
        toast.success("Mulai mengikuti pengguna! 🎉");
      } else {
        await apiClient.delete("/follow", {
          data: {
            followerId: user.id,
            followingId: targetNotif.refId,
          },
        });
        toast.success("Batal mengikuti pengguna.");
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId
            ? { ...n, isFollowingSender: isNowFollowing }
            : n
        )
      );
    } catch {
      toast.error("Gagal memperbarui status ikutan.");
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "following") return n.isFollowingSender === true;
    if (filter === "comments") return n.type === "comment" || n.type === "reply";
    if (filter === "follows") return n.type === "follow";
    return true;
  });

  const { today, thisWeek, thisMonth, older } = groupNotifications(filteredNotifs);

  const renderSection = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-ig-text font-bold text-xs mb-3 px-2 tracking-wide uppercase opacity-75">{title}</h2>
        <ul className="space-y-1">
          {items.map((notif) => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onFollowToggle={handleFollowToggle}
              onCloseDrawer={() => setIsOpen(false)}
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      ref={drawerRef}
      className={`fixed top-0 z-40 h-screen w-full md:w-[397px] bg-ig-background border-r border-ig-border shadow-2xl flex flex-col transition-all duration-300 ease-in-out select-none ${
        isOpen
          ? "left-0 md:left-[72px] opacity-100 translate-x-0"
          : "-translate-x-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-ig-border">
        <h1 className="text-ig-text text-xl font-bold tracking-tight">Notifikasi</h1>
        <button
          onClick={() => setIsOpen(false)}
          className="text-ig-text hover:opacity-60 transition-opacity cursor-pointer md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-6 py-4 border-b border-ig-border/40 shrink-0">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === "all"
              ? "bg-ig-text text-ig-background"
              : "bg-ig-elevated-bg border border-ig-border text-ig-text hover:bg-neutral-800"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("following")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === "following"
              ? "bg-ig-text text-ig-background"
              : "bg-ig-elevated-bg border border-ig-border text-ig-text hover:bg-neutral-800"
          }`}
        >
          Mengikuti
        </button>
        <button
          onClick={() => setFilter("comments")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === "comments"
              ? "bg-ig-text text-ig-background"
              : "bg-ig-elevated-bg border border-ig-border text-ig-text hover:bg-neutral-800"
          }`}
        >
          Komentar
        </button>
        <button
          onClick={() => setFilter("follows")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === "follows"
              ? "bg-ig-text text-ig-background"
              : "bg-ig-elevated-bg border border-ig-border text-ig-text hover:bg-neutral-800"
          }`}
        >
          Pengikut
        </button>
      </div>

      {/* List Notifikasi */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col gap-3 justify-center items-center h-[50vh]">
            <Loader2 className="w-6 h-6 text-ig-primary animate-spin" />
            <p className="text-ig-secondary-text text-[11px] font-medium tracking-wide animate-pulse">
              Memuat notifikasi...
            </p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-3xl mb-3">🔔</span>
            <p className="text-ig-secondary-text text-xs">Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderSection("Hari Ini", today)}
            {renderSection("Minggu Ini", thisWeek)}
            {renderSection("Bulan Ini", thisMonth)}
            {renderSection("Sebelumnya", older)}
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notif: Notification;
  onFollowToggle: (notifId: string, isNowFollowing: boolean) => void;
  onCloseDrawer: () => void;
}

function NotificationItem({ notif, onFollowToggle, onCloseDrawer }: NotificationItemProps) {
  const navigate = useNavigate();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const sender = notif.sender;
  const post = notif.post;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sender) {
      navigate(`/profile/${sender.username}`);
      onCloseDrawer();
    }
  };

  const handlePostClick = () => {
    if (post) {
      navigate(`/posts/${post.id}`);
      onCloseDrawer();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Jika diklik adalah link username (bercetak tebal), abaikan navigasi post/profil
    if ((e.target as HTMLElement).tagName === 'SPAN' && (e.target as HTMLElement).classList.contains('font-bold')) {
      return;
    }

    if (notif.type === "follow") {
      if (sender) {
        navigate(`/profile/${sender.username}`);
        onCloseDrawer();
      }
    } else if (post) {
      navigate(`/posts/${post.id}`);
      onCloseDrawer();
    }
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActionLoading) return;
    setIsActionLoading(true);
    const newFollowState = !notif.isFollowingSender;
    await onFollowToggle(notif.id, newFollowState);
    setIsActionLoading(false);
  };

  const username = sender?.username || "Seseorang";
  let actionText = notif.message;
  if (sender && actionText.startsWith(sender.username)) {
    actionText = actionText.substring(sender.username.length).trim();
  }

  const avatarUrl =
    sender?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

  return (
    <li className="flex items-center justify-between gap-3 py-2.5 hover:bg-ig-secondary-bg/30 px-2 rounded-xl transition-colors group select-none">
      {/* Kiri: Avatar */}
      <div
        onClick={handleProfileClick}
        className="w-9 h-9 rounded-full overflow-hidden border border-ig-border flex-shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
      >
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Tengah: Deskripsi */}
      <div 
        onClick={handleContentClick}
        className={`flex-1 min-w-0 text-left ${
          (notif.type === "follow" || post) ? "cursor-pointer" : ""
        }`}
      >
        <p className="text-ig-text text-xs leading-snug break-words">
          <span
            onClick={handleProfileClick}
            className="font-bold hover:underline cursor-pointer mr-1"
          >
            {username}
          </span>
          <span className="text-neutral-300">{actionText}</span>
          <span className="text-ig-secondary-text text-[11px] ml-1 whitespace-nowrap">
            {formatNotifTime(notif.createdAt)}
          </span>
        </p>
      </div>

      {/* Kanan: Tombol Tindakan atau Pratinjau Postingan */}
      <div className="flex-shrink-0 flex items-center justify-end min-w-[70px]">
        {notif.type === "follow" && (
          <button
            onClick={handleFollowClick}
            disabled={isActionLoading}
            className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
              notif.isFollowingSender
                ? "bg-ig-elevated-bg border border-ig-border text-ig-text hover:bg-neutral-800"
                : "bg-ig-primary text-white hover:bg-ig-primary-hover"
            }`}
          >
            {isActionLoading && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {notif.isFollowingSender ? "Mengikuti" : "Ikuti"}
          </button>
        )}

        {(notif.type === "like" || notif.type === "comment" || notif.type === "reply") && post && (
          <div
            onClick={handlePostClick}
            className="w-9 h-9 rounded-[4px] overflow-hidden border border-ig-border bg-neutral-800 cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-sm flex-shrink-0"
            title="Lihat postingan"
          >
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Pratinjau konten"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-1 bg-ig-elevated-bg">
                <span className="text-[7px] text-ig-secondary-text line-clamp-3 leading-none text-center">
                  {post.content}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
