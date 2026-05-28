import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../../../../shared/src/types/post";

interface PostGridProps {
  posts: Post[];
  emptyMessage?: string;
  emptyAction?: {
    text: string;
    to: string;
  };
  isLoading?: boolean;
}

export function PostGrid({ posts, emptyMessage, emptyAction, isLoading }: PostGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-[2px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative aspect-[4/5] overflow-hidden bg-ig-elevated-bg animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <span className="text-4xl">📷</span>
        {emptyMessage && <p className="text-ig-text font-semibold">{emptyMessage}</p>}
        {emptyAction && (
          <>
            <p className="text-ig-secondary-text text-sm">Belum ada postingan.</p>
            <Link
              to={emptyAction.to}
              className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80"
            >
              {emptyAction.text}
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/posts/${post.id}`}
          className="relative aspect-[4/5] overflow-hidden group cursor-pointer bg-ig-elevated-bg"
        >
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.content}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center p-3">
              <span className="text-xs text-ig-secondary-text line-clamp-3 text-center">
                {post.content}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Heart size={20} fill="white" />
              <span>{post._count?.likes ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-white">
              <MessageCircle size={20} fill="white" />
              <span>{post._count?.comments ?? 0}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
