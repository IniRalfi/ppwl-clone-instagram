import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: Home,       to: "/" },
  { icon: Search,      to: "/search" },
  { icon: PlusSquare, to: "/create" },
  { icon: Heart,      to: "/notifications" },
  { icon: User,       to: "/profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ig-background border-t border-neutral-800 flex md:hidden items-center justify-around h-16 z-50 px-2">
      {navItems.map(({ icon: Icon, to }) => (
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
      ))}
    </nav>
  );
}