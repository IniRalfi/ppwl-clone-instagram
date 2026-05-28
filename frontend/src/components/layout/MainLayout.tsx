import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-ig-background text-ig-text">
      {/* Sidebar: Tampil di desktop (md ke atas), tersembunyi di mobile */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen w-[72px]">
        <Sidebar />
      </div>

      {/* Konten Utama Aplikasi */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* BottomNav: Tampil di mobile (di bawah md), tersembunyi di desktop */}
      <BottomNav />
    </div>
  );
}