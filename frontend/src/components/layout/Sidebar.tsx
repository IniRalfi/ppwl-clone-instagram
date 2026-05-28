import { Home, Search, PlusSquare, Heart, User, LogOut, Moon, Sun, Activity } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { useNotificationDrawerStore } from "../../store/notification-drawer.store";
import { useNotificationStore } from "../../store/notification.store";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Beranda", to: "/", wip: false },
  { icon: Search, label: "Cari", to: "/explore", wip: false },
  { icon: PlusSquare, label: "Buat Post", to: "/create", wip: false },
  { icon: Heart, label: "Notifikasi", to: "/notifications", wip: false },
  { icon: User, label: "Profil", to: "/profile", wip: false },
  { icon: Activity, label: "Monitoring", to: "/monitoring", wip: false },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();
  const { isOpen: isNotifOpen, toggle: toggleNotif } = useNotificationDrawerStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const isAdmin = user?.role === "ADMIN";

  const visibleItems = navItems.filter((item) => item.to !== "/monitoring" || isAdmin);

  return (
    <aside className="left-sidebar fixed top-0 left-0 h-screen w-[72px] hover:w-[244px] bg-ig-background/95 backdrop-blur-md border-r border-ig-border px-3 py-6 transition-all duration-300 ease-in-out z-50 group/sidebar shadow-sm hover:shadow-[5px_0_25px_rgba(0,0,0,0.15)] flex flex-col">
      {/* Logo Instafy */}
      <div className="mb-8 px-3 h-10 flex items-center justify-start overflow-hidden">
        <img
          src="/favicon/favicon.svg"
          alt="Instafy Logo"
          className="w-7 h-7 object-contain flex-shrink-0 transition-transform duration-300 group-hover/sidebar:rotate-12"
        />
        <span className="text-ig-text font-bold text-xl font-[var(--font-outfit)] tracking-wide opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 ease-in-out whitespace-nowrap ml-0 group-hover/sidebar:ml-3">
          Instafy
        </span>
      </div>

      {/* Spacer untuk mendorong menu navigasi agar mulai dari tengah */}
      <div className="flex-grow" />

      {/* Menu Navigasi (Mulai dari tengah) */}
      <nav className="flex flex-col gap-1.5 justify-center">
        {visibleItems.map(({ icon: Icon, label, to, wip }) => {
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
                className="flex items-center px-3 py-2.5 rounded-lg transition-all hover:bg-ig-elevated-bg text-ig-secondary-text w-full text-left group cursor-pointer"
              >
                <Icon
                  className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 text-[14px] tracking-wide whitespace-nowrap overflow-hidden ml-0 group-hover/sidebar:ml-4">
                  {label}
                </span>
              </button>
            );
          }

          if (to === "/notifications") {
            return (
              <button
                key={to}
                onClick={toggleNotif}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all hover:bg-ig-elevated-bg group w-full text-left cursor-pointer ${
                  isNotifOpen
                    ? "text-ig-text font-semibold bg-ig-elevated-bg/55"
                    : "text-ig-secondary-text hover:text-ig-text"
                }`}
              >
                <span className="relative flex-shrink-0">
                  <Icon
                    className="w-6 h-6 transition-transform group-hover:scale-105"
                    strokeWidth={isNotifOpen ? 2.2 : 1.5}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 min-w-[16px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 text-[14px] tracking-wide whitespace-nowrap overflow-hidden ml-0 group-hover/sidebar:ml-4">
                  {label}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-all hover:bg-ig-elevated-bg group ${
                  isActive
                    ? "text-ig-text font-semibold bg-ig-elevated-bg/55"
                    : "text-ig-secondary-text hover:text-ig-text"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
                    strokeWidth={isActive ? 2.2 : 1.5}
                  />
                  <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 text-[14px] tracking-wide whitespace-nowrap overflow-hidden ml-0 group-hover/sidebar:ml-4">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Spacer bawah untuk keseimbangan menu tengah */}
      <div className="flex-grow" />

      {/* Bagian Bawah: Tema + Logout */}
      <div className="flex flex-col gap-1 pt-3 border-t border-ig-separator">
        <button
          onClick={toggleTheme}
          className="flex items-center px-3 py-2.5 rounded-lg hover:bg-ig-elevated-bg text-ig-secondary-text hover:text-ig-text transition-all w-full text-left group cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun
              className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />
          )}
          <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 text-[14px] tracking-wide whitespace-nowrap overflow-hidden ml-0 group-hover/sidebar:ml-4">
            Tampilan
          </span>
        </button>

        <button
          onClick={logout}
          className="flex items-center px-3 py-2.5 rounded-lg hover:bg-ig-elevated-bg text-ig-secondary-text hover:text-ig-text transition-all w-full text-left group cursor-pointer"
        >
          <LogOut
            className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
            strokeWidth={1.5}
          />
          <span className="opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 text-[14px] tracking-wide whitespace-nowrap overflow-hidden ml-0 group-hover/sidebar:ml-4">
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
}
