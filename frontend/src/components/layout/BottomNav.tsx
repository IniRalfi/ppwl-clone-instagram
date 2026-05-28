import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNotificationStore } from "../../store/notification.store";
import { toast } from "sonner";

const navItems = [
  { icon: Home,       to: "/",             label: "Beranda",    wip: false },
  { icon: Search,     to: "/explore",       label: "Cari",       wip: false  },
  { icon: PlusSquare, to: "/create",       label: "Buat Post",  wip: false },
  { icon: Heart,      to: "/notifications", label: "Notifikasi", wip: false },
  { icon: User,       to: "/profile",      label: "Profil",     wip: false },
];

export function BottomNav() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ig-background border-t border-ig-border flex md:hidden items-center justify-around h-[49px] z-50 px-1">
      {navItems.map(({ icon: Icon, to, label, wip }) => {
        if (wip) {
          return (
            <button
              key={to}
              onClick={() =>
                toast.info("🚧 Masih dalam proses pengembangan", {
                  description: `Fitur "${label}" belum tersedia saat ini.`,
                  duration: 2500,
                })
              }
              className="flex-1 flex items-center justify-center h-full text-ig-secondary-text"
              aria-label={label}
            >
              <Icon className="w-6 h-6" strokeWidth={1.5} />
            </button>
          );
        }

        if (to === "/notifications") {
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center h-full transition-colors ${
                  isActive ? "text-ig-text" : "text-ig-secondary-text"
                }`
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <span className="relative">
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-[16px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        }

        return (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center h-full transition-colors ${
                isActive ? "text-ig-text" : "text-ig-secondary-text"
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
