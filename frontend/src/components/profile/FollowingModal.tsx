import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { apiClient } from "../../services/api.client";
import { toast } from "sonner";

interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface FollowingModalProps {
  userId: string;
  loggedInUserId?: string;
  onClose: () => void;
  onFollowStatsChange: (stats: { following: number }) => void;
}

export function FollowingModal({
  userId,
  loggedInUserId,
  onClose,
  onFollowStatsChange,
}: FollowingModalProps) {
  const [list, setList] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get<{ data: FollowUser[] }>(`/follow/following/${userId}`)
      .then((res) => {
        if (res && res.data) {
          setList(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar mengikuti:", err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleUnfollow = async (followingId: string, username: string) => {
    if (!loggedInUserId || togglingId) return;
    setTogglingId(followingId);
    try {
      await apiClient.delete("/follow", {
        followerId: loggedInUserId,
        followingId: followingId,
      });
      const updatedList = list.filter((u) => u.id !== followingId);
      setList(updatedList);
      onFollowStatsChange({ following: updatedList.length });
      toast.success(`Batal mengikuti @${username}`);
    } catch {
      toast.error("Gagal batal mengikuti.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <span className="text-ig-text font-semibold text-sm">Mengikuti</span>
          <button
            onClick={onClose}
            className="text-ig-text hover:opacity-60 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-neutral-500" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-ig-secondary-text text-sm text-center py-10">
              Belum mengikuti siapapun.
            </p>
          ) : (
            list.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div
                  className="cursor-pointer flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => {
                    navigate(`/profile/${u.username}`);
                    onClose();
                  }}
                >
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ig-text text-sm font-semibold truncate">
                      {u.username}
                    </p>
                    <p className="text-ig-secondary-text text-xs truncate">
                      {u.name}
                    </p>
                  </div>
                </div>
                {loggedInUserId === userId && (
                  <button
                    disabled={togglingId === u.id}
                    onClick={() => handleUnfollow(u.id, u.username)}
                    className="text-xs font-semibold px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-ig-text rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {togglingId === u.id ? "Memproses..." : "Mengikuti"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
