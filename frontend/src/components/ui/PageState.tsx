import { AlertTriangle, RefreshCw } from "lucide-react";
import { Skeleton } from "./Skeleton";

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({ title = "Terjadi Kesalahan", message = "Gagal memuat data. Silakan coba lagi.", onRetry }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-ig-text mb-1">{title}</h3>
      <p className="text-sm text-ig-secondary-text max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-lg bg-ig-primary px-4 py-2 text-sm font-semibold text-white hover:bg-ig-primary-hover transition"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}

export function MessagesPageSkeleton() {
  return (
    <div className="mx-auto flex h-[calc(100vh-49px)] w-full max-w-6xl md:h-screen md:border-x md:border-ig-border">
      <div className="w-full md:w-[360px] md:min-w-[360px] border-r border-ig-border p-4 space-y-1">
        <Skeleton className="h-9 w-24 rounded mb-4" />
        <Skeleton className="h-9 w-full rounded-xl mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

export function NotificationPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-3">
      <Skeleton className="h-9 w-36 rounded mb-4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExplorePageSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-md" />
      ))}
    </div>
  );
}
