import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { apiClient } from "../../services/api.client";
import { Avatar } from "./Avatar";
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
    <div className="w-full text-left select-none">
      {/* Header User yang Sedang Login */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ig-text truncate leading-tight">{user.username}</p>
            <p className="text-[13px] text-ig-secondary-text truncate mt-0.5">{user.name}</p>
          </div>
        </div>
        <button className="text-[12px] font-semibold text-ig-primary hover:text-white transition-colors cursor-pointer">
          Switch
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-ig-secondary-text">
          Suggested for you
        </span>
        <button className="text-xs font-semibold text-ig-text hover:text-ig-secondary-text transition-colors cursor-pointer">
          See all
        </button>
      </div>

      {/* List Suggestions */}
      <div className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ig-elevated-bg flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-ig-elevated-bg rounded w-24" />
                    <div className="h-2.5 bg-ig-elevated-bg rounded w-16" />
                  </div>
                </div>
                <div className="h-4 w-10 bg-ig-elevated-bg rounded" />
              </div>
            ))
          : suggestions.map((sugUser) => {
              const isFollowed = followedIds.has(sugUser.id);
              const isThisLoading = loadingId === sugUser.id;
              return (
                <div key={sugUser.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
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
                      <p className="text-[11px] text-ig-secondary-text truncate mt-0.5">
                        {sugUser._count.followers > 0
                          ? `${sugUser._count.followers} followers`
                          : "Suggested for you"}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Follow / Followed */}
                  <button
                    onClick={() => !isFollowed && handleFollow(sugUser.id)}
                    disabled={isThisLoading}
                    className={`text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                      isFollowed
                        ? "text-ig-secondary-text cursor-default"
                        : "text-ig-primary hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {isFollowed ? "Following" : isThisLoading ? "..." : "Follow"}
                  </button>
                </div>
              );
            })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-[11px] text-ig-secondary-text space-y-4">
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-ig-secondary-text/80">
          {["About", "Help", "Press", "API", "Jobs", "Privacy", "Terms", "Locations", "Language", "Meta Verified"].map((link, idx, arr) => (
            <span key={link} className="hover:underline cursor-pointer">
              {link} {idx < arr.length - 1 && "•"}
            </span>
          ))}
        </div>
        <p className="opacity-60 uppercase tracking-tight text-[10px]">© 2026 INSTAFY FROM META</p>
      </div>
    </div>
  );
}
