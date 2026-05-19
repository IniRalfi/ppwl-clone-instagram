import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

const navItems = [
  { icon: Home,       to: "/",             label: "Beranda",    wip: false },
  { icon: Search,     to: "/search",       label: "Cari",       wip: true  },
  { icon: PlusSquare, to: "/create",       label: "Buat Post",  wip: false },
  { icon: Heart,      to: "/notifications", label: "Notifikasi", wip: false },
  { icon: User,       to: "/profile",      label: "Profil",     wip: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ig-background border-t border-neutral-800 flex md:hidden items-center justify-around h-16 z-50 px-2">
      {navItems.map(({ icon: Icon, to, label, wip }) =>
        wip ? (
          <button
            key={to}
            onClick={() =>
              toast.info("🚧 Masih dalam proses pengembangan", {
                description: `Fitur "${label}" belum tersedia saat ini.`,
                duration: 2500,
              })
            }
            className="flex-1 flex items-center justify-center h-full text-neutral-500"
          >
            <Icon className="w-6 h-6 flex-shrink-0" />
          </button>
        ) : (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center h-full transition-colors ${
                isActive ? "text-ig-text" : "text-neutral-500"
              }`
            }
          >
            <Icon className="w-6 h-6 flex-shrink-0" />
          </NavLink>
        )
      )}
    </nav>
  );
}