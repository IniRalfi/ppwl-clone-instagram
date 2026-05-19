import { useAuthStore } from "../store/auth.store";
import { ThemeToggle } from "../components/common/ThemeToggle";

export default function HomePage() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-ig-background">
      {/* Header sementara — akan digantikan Sidebar dari Salsabila */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800 sticky top-0 bg-ig-background z-10">
        <span className="text-ig-text font-semibold text-lg">Instagram</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={logout}
            className="text-ig-primary text-sm font-semibold"
          >
            Keluar
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <p>🏠 Beranda — Dikerjakan oleh Adella &amp; Rifa</p>
      </div>
    </div>
  );
}
