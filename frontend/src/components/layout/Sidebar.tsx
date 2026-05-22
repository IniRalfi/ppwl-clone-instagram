import { Home, Search, PlusSquare, Heart, User, LogOut, Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Beranda", to: "/", wip: false },
  { icon: Search, label: "Cari", to: "/search", wip: true },
  { icon: PlusSquare, label: "Buat Post", to: "/create", wip: false },
  { icon: Heart, label: "Notifikasi", to: "/notifications", wip: false },
  { icon: User, label: "Profil", to: "/profile", wip: false },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <aside className="flex flex-col h-screen w-[72px] md:w-[244px] bg-ig-background border-r border-ig-border px-3 py-6 transition-all duration-300">
      {/* Logo Instagram */}
      <div className="mb-6 px-3 h-10 flex items-center">
        <span className="text-ig-text font-bold text-xl font-['Instagram_Sans_Condensed'] hidden md:block tracking-wide">
          Instagaram
        </span>
        {/* Mini logo saat kolaps di tablet */}
        <span className="text-ig-text font-bold text-2xl block md:hidden mx-auto">✦</span>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ icon: Icon, label, to, wip }) =>
          wip ? (
            <button
              key={to}
              onClick={() =>
                toast.info("🚧 Masih dalam proses pengembangan", {
                  description: `Fitur "${label}" belum tersedia saat ini.`,
                  duration: 2500,
                })
              }
              className="flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-ig-elevated-bg text-ig-secondary-text w-full text-left group"
            >
              <Icon
                className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />
              <span className="hidden md:block text-[15px]">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-ig-elevated-bg group ${
                  isActive
                    ? "text-ig-text font-semibold"
                    : "text-ig-secondary-text hover:text-ig-text"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110"
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span className="hidden md:block text-[15px]">{label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      {/* Bagian Bawah: Tema + Logout */}
      <div className="flex flex-col gap-0.5 pt-3 border-t border-ig-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-ig-elevated-bg text-ig-secondary-text hover:text-ig-text transition-colors w-full text-left group"
        >
          {theme === "dark" ? (
            <Sun
              className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
          )}
          <span className="hidden md:block text-[15px]">Tampilan</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-ig-elevated-bg text-ig-secondary-text hover:text-ig-text transition-colors w-full text-left group"
        >
          <LogOut
            className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110"
            strokeWidth={1.5}
          />
          <span className="hidden md:block text-[15px]">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
