import { Home, Search, PlusSquare, Heart, User, LogOut, Moon, Sun, Activity } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
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

  const isAdmin =
    user?.username === "rafli_pratama" ||
    user?.email === "rflipratm@gmail.com" ||
    user?.username?.includes("admin");

  const visibleItems = navItems.filter((item) => item.to !== "/monitoring" || isAdmin);

  return (
    <aside className="flex flex-col h-screen w-[72px] md:w-[244px] bg-ig-background border-r border-ig-border px-3 py-6 transition-all duration-300">
      {/* Logo Instagram */}
      <div className="mb-8 px-3 h-10 flex items-center">
        <span className="text-ig-text font-bold text-xl font-['Instagram_Sans_Condensed'] hidden md:block tracking-wider">
          Instagram
        </span>
        {/* Mini logo saat kolaps di tablet */}
        <span className="text-ig-text font-bold text-2xl block md:hidden mx-auto">✦</span>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {visibleItems.map(({ icon: Icon, label, to, wip }) =>
          wip ? (
            <button
              key={to}
              onClick={() =>
                toast.info("🚧 Masih dalam proses pengembangan", {
                  description: `Fitur "${label}" belum tersedia saat ini.`,
                  duration: 2500,
                })
              }
              className="flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors hover:bg-ig-elevated-bg text-ig-secondary-text w-full text-left group"
            >
              <Icon
                className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
                strokeWidth={1.5}
              />
              <span className="hidden md:block text-[14px] tracking-wide">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors hover:bg-ig-elevated-bg group ${
                  isActive
                    ? "text-ig-text font-semibold"
                    : "text-ig-secondary-text hover:text-ig-text"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span className="hidden md:block text-[14px] tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      {/* Bagian Bawah: Tema + Logout */}
      <div className="flex flex-col gap-1 pt-3 border-t border-ig-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-ig-elevated-bg text-ig-secondary-text hover:text-ig-text transition-colors w-full text-left group"
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
          <span className="hidden md:block text-[14px] tracking-wide">Tampilan</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-ig-elevated-bg text-ig-secondary-text hover:text-ig-text transition-colors w-full text-left group"
        >
          <LogOut
            className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105"
            strokeWidth={1.5}
          />
          <span className="hidden md:block text-[14px] tracking-wide">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
