import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { apiClient } from "../../services/api.client";
import { Avatar } from "./Avatar";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  _count: { followers: number };
}

export function SuggestedUsers() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // State untuk mengontrol kemunculan modal "See all"
  const [showModal, setShowModal] = useState(false);

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

  const handleProfileClick = (targetUsername: string) => {
    if (targetUsername === user?.username) {
      navigate("/profile");
    } else {
      navigate(`/profile/${targetUsername}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar! 👋");
    navigate("/login");
  };

  if (!user || (!isLoading && suggestions.length === 0)) return null;

  // Hanya tampilkan maksimal 5 akun di sidebar utama
  const sidebarSuggestions = suggestions.slice(0, 5);

  return (
    <div className="w-full text-left select-none relative">
      {/* Header User yang Sedang Login */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => handleProfileClick(user.username)}
            className="cursor-pointer"
          >
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
          </div>
          <div 
            onClick={() => handleProfileClick(user.username)}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <p className="text-sm font-semibold text-ig-text hover:underline truncate leading-tight">{user.username}</p>
            <p className="text-[13px] text-ig-secondary-text truncate mt-0.5">{user.name}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-[12px] font-semibold text-ig-primary hover:text-red-500 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-ig-secondary-text">
          Suggested for you
        </span>
        <button 
          onClick={() => setShowModal(true)}
          className="text-xs font-semibold text-ig-text hover:text-ig-secondary-text transition-colors cursor-pointer"
        >
          See all
        </button>
      </div>

      {/* List Suggestions (Maksimal 5) */}
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
          : sidebarSuggestions.map((sugUser) => {
              const isFollowed = followedIds.has(sugUser.id);
              const isThisLoading = loadingId === sugUser.id;
              return (
                <div key={sugUser.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => handleProfileClick(sugUser.username)}
                      className="cursor-pointer"
                    >
                      <Avatar
                        name={sugUser.name}
                        avatarUrl={sugUser.avatarUrl}
                        size="sm"
                        className="flex-shrink-0"
                      />
                    </div>
                    <div 
                      onClick={() => handleProfileClick(sugUser.username)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-ig-text hover:underline truncate leading-tight">
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

      {/* Footer (Hanya copyright, tautan tidak fungsional dihapus) */}
      <div className="mt-8 text-[11px] text-ig-secondary-text space-y-4">
        <p className="opacity-60 uppercase tracking-tight text-[10px]">© 2026 INSTAFY FROM META</p>
      </div>

      {/* ── MODAL SEE ALL SUGGESTED USERS ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-ig-secondary-bg border border-ig-border rounded-xl w-full max-w-[480px] h-[600px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-ig-border">
              <span className="font-bold text-ig-text text-base">Suggested</span>
              <button 
                onClick={() => setShowModal(false)}
                className="text-ig-text hover:text-ig-secondary-text p-1 rounded-full hover:bg-ig-elevated-bg transition-colors cursor-pointer"
                aria-label="Tutup rekomendasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Modal Body */}
            <div className="overflow-y-auto p-4 flex flex-col gap-4">
              {suggestions.map((sugUser) => {
                const isFollowed = followedIds.has(sugUser.id);
                const isThisLoading = loadingId === sugUser.id;
                return (
                  <div key={sugUser.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => {
                          setShowModal(false);
                          handleProfileClick(sugUser.username);
                        }}
                        className="cursor-pointer"
                      >
                        <Avatar
                          name={sugUser.name}
                          avatarUrl={sugUser.avatarUrl}
                          size="sm"
                          className="flex-shrink-0"
                        />
                      </div>
                      <div 
                        onClick={() => {
                          setShowModal(false);
                          handleProfileClick(sugUser.username);
                        }}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="text-sm font-semibold text-ig-text hover:underline truncate leading-tight">
                          {sugUser.username}
                        </p>
                        <p className="text-[11px] text-ig-secondary-text truncate mt-0.5">
                          {sugUser._count.followers > 0
                            ? `${sugUser._count.followers} followers`
                            : "Suggested for you"}
                        </p>
                      </div>
                    </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
