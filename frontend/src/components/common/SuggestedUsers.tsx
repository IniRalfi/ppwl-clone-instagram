import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { apiClient } from "../../services/api.client";
import { Avatar } from "./Avatar";
import { UserPlus, Check } from "lucide-react";
import { toast } from "sonner";

interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  _count: { followers: number };
}

export function SuggestedUsers() {
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track siapa yang sudah di-follow dalam sesi ini
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    apiClient
      .get<{ data: SuggestedUser[] }>(`/follow/suggestions?userId=${user.id}`)
      .then((res) => setSuggestions(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handleFollow = async (targetId: string) => {
    if (!user?.id || loadingId) return;
    setLoadingId(targetId);
    try {
      await apiClient.post("/follow", {
        followerId: user.id,
        followingId: targetId,
      });
      setFollowedIds((prev) => new Set(prev).add(targetId));
      toast.success("Berhasil mengikuti pengguna! 🎉");
    } catch {
      toast.error("Gagal mengikuti pengguna. Coba lagi.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!user || (!isLoading && suggestions.length === 0)) return null;

  return (
    <div className="w-full">
      {/* Header User yang Sedang Login */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ig-text truncate">{user.username}</p>
          <p className="text-xs text-ig-secondary-text truncate">{user.name}</p>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-ig-secondary-text">
          Suggested for you
        </span>
        <button className="text-xs font-semibold text-ig-text hover:text-ig-secondary-text transition-colors">
          See All
        </button>
      </div>

      {/* List Suggestions */}
      <div className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              // Skeleton loading
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-ig-elevated-bg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-ig-elevated-bg rounded w-24" />
                  <div className="h-2.5 bg-ig-elevated-bg rounded w-16" />
                </div>
                <div className="h-7 w-14 bg-ig-elevated-bg rounded" />
              </div>
            ))
          : suggestions.map((sugUser) => {
              const isFollowed = followedIds.has(sugUser.id);
              const isThisLoading = loadingId === sugUser.id;
              return (
                <div key={sugUser.id} className="flex items-center gap-3">
                  <Avatar
                    name={sugUser.name}
                    avatarUrl={sugUser.avatarUrl}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ig-text truncate leading-tight">
                      {sugUser.username}
                    </p>
                    <p className="text-xs text-ig-secondary-text truncate">
                      {sugUser._count.followers > 0
                        ? `${sugUser._count.followers} followers`
                        : "Suggested for you"}
                    </p>
                  </div>

                  {/* Tombol Follow / Followed */}
                  <button
                    onClick={() => !isFollowed && handleFollow(sugUser.id)}
                    disabled={isThisLoading}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded transition-all duration-200 flex-shrink-0 ${
                      isFollowed
                        ? "text-ig-secondary-text"
                        : "text-ig-primary hover:text-blue-400"
                    } disabled:opacity-50`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : isThisLoading ? (
                      <span className="opacity-60">...</span>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-ig-secondary-text space-y-3">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {["About", "Help", "Privacy", "Terms"].map((link) => (
            <span key={link} className="hover:underline cursor-pointer">
              {link}
            </span>
          ))}
        </div>
        <p className="opacity-60">© 2025 PPWL Instagram Clone</p>
      </div>
    </div>
  );
}
