import { Home, Search, PlusSquare, Heart, User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ThemeToggle } from "../common/ThemeToggle";
import { toast } from "sonner";

const navItems = [
  { icon: Home,       label: "Beranda",    to: "/",             wip: false },
  { icon: Search,     label: "Cari",       to: "/search",       wip: true  },
  { icon: PlusSquare, label: "Buat Post",  to: "/create",       wip: false },
  { icon: Heart,      label: "Notifikasi", to: "/notifications", wip: false },
  { icon: User,       label: "Profil",     to: "/profile",      wip: false },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="flex flex-col h-screen w-[72px] md:w-[244px] bg-ig-background border-r border-neutral-800 px-3 py-6 transition-all duration-300">
      {/* Logo Instagram */}
      <div className="mb-8 px-2 h-10 flex items-center">
        <span className="text-ig-text font-bold text-xl font-['Instagram_Sans_Condensed'] hidden md:block tracking-wide">
          Instagram
        </span>
        {/* Placeholder mini logo saat mode tablet/collapsed jika diperlukan */}
        <span className="text-ig-text font-bold text-xl block md:hidden mx-auto">
          IG
        </span>
      </div>
      
      {/* Menu Navigasi */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, to, wip }) =>
          wip ? (
            // Tombol WIP — tampilkan toast, tidak navigasi ke mana-mana
            <button
              key={to}
              onClick={() =>
                toast.info("🚧 Masih dalam proses pengembangan", {
                  description: `Fitur "${label}" belum tersedia saat ini.`,
                  duration: 2500,
                })
              }
              className="flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-ig-secondary-bg text-neutral-400 w-full text-left group"
            >
              <Icon className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span className="hidden md:block text-sm">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-ig-secondary-bg group ${
                  isActive ? "text-ig-text font-semibold" : "text-neutral-400"
                }`
              }
            >
              <Icon className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span className="hidden md:block text-sm">{label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* Bagian Bawah: ThemeToggle + Logout */}
      <div className="flex flex-col gap-2 pt-4 border-t border-neutral-800/50">
        <div className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-ig-secondary-bg/50 transition-colors">
          <ThemeToggle />
          <span className="hidden md:block text-ig-text text-sm select-none">Tema</span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-ig-secondary-bg text-neutral-400 hover:text-ig-badge transition-colors w-full text-left"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          <span className="hidden md:block text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
}