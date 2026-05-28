import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { useWebPush } from "../../hooks/useWebPush";
import { useAuthStore } from "../../store/auth.store";

const DISMISSED_KEY = "push-permission-dismissed";

export function PushPermissionModal() {
  const user = useAuthStore((state) => state.user);
  const { isSupported, permission, subscribe } = useWebPush();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    setIsVisible(Boolean(user && isSupported && permission === "default" && !dismissed));
  }, [user, isSupported, permission]);

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  const handleEnable = async () => {
    try {
      const subscribed = await subscribe();
      if (subscribed) {
        toast.success("Notifikasi browser berhasil diaktifkan.");
        setIsVisible(false);
      } else {
        close();
      }
    } catch (error) {
      console.error("Gagal mengaktifkan web push:", error);
      toast.error("Gagal mengaktifkan notifikasi browser.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-ig-border bg-ig-background p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      <button
        type="button"
        onClick={close}
        className="absolute right-3 top-3 rounded-full p-1 text-ig-secondary-text hover:bg-ig-elevated-bg hover:text-ig-text"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ig-primary/15 text-ig-primary">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ig-text">Aktifkan Notifikasi?</h2>
          <p className="mt-1 text-xs leading-relaxed text-ig-secondary-text">
            Dapatkan notifikasi like, komentar, dan follow walaupun tab sedang di background.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={close}
          className="flex-1 rounded-lg border border-ig-border px-3 py-2 text-xs font-semibold text-ig-text hover:bg-ig-elevated-bg"
        >
          Nanti saja
        </button>
        <button
          type="button"
          onClick={handleEnable}
          className="flex-1 rounded-lg bg-ig-primary px-3 py-2 text-xs font-semibold text-white hover:bg-ig-primary-hover"
        >
          Aktifkan
        </button>
      </div>
    </div>
  );
}
