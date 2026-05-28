import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-300 dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="w-full max-w-[470px] mx-auto border-b border-ig-border pb-6 mb-4 flex flex-col gap-3">
      {/* Header Post */}
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            {/* Username */}
            <Skeleton className="w-24 h-3.5 rounded" />
            {/* Location or time */}
            <Skeleton className="w-16 h-2.5 rounded" />
          </div>
        </div>
        {/* Triple dots menu */}
        <Skeleton className="w-6 h-1.5 rounded" />
      </div>

      {/* Main post image placeholder */}
      <Skeleton className="w-full aspect-[4/5] rounded-sm" />

      {/* Action Bar (Love, Comment, Share, Bookmark) */}
      <div className="flex justify-between items-center py-2 px-1">
        <div className="flex gap-4">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>

      {/* Likes */}
      <div className="px-1">
        <Skeleton className="w-20 h-3 rounded" />
      </div>

      {/* Content description */}
      <div className="px-1 space-y-1.5">
        <Skeleton className="w-full h-3 rounded" />
        <Skeleton className="w-4/5 h-3 rounded" />
      </div>
    </div>
  );
}

export function ProfileGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-[2px] md:gap-7 py-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="aspect-square w-full rounded-md" />
      ))}
    </div>
  );
}

export { Skeleton };
