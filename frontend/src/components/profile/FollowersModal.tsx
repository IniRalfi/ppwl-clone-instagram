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

interface FollowersModalProps {
  userId: string;
  loggedInUserId?: string;
  onClose: () => void;
  onFollowStatsChange: (stats: { followers: number }) => void;
}

export function FollowersModal({
  userId,
  loggedInUserId,
  onClose,
  onFollowStatsChange,
}: FollowersModalProps) {
  const [list, setList] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get<{ data: FollowUser[] }>(`/follow/followers/${userId}`)
      .then((res) => {
        if (res && res.data) {
          setList(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat pengikut:", err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleRemove = async (followerId: string) => {
    if (!loggedInUserId || removingId) return;
    setRemovingId(followerId);
    try {
      await apiClient.delete("/follow", {
        followerId: followerId,
        followingId: loggedInUserId,
      });
      const updatedList = list.filter((u) => u.id !== followerId);
      setList(updatedList);
      onFollowStatsChange({ followers: updatedList.length });
      toast.success("Pengikut berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus pengikut.");
    } finally {
      setRemovingId(null);
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
          <span className="text-ig-text font-semibold text-sm">Pengikut</span>
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
              Belum ada pengikut.
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
                    disabled={removingId === u.id}
                    onClick={() => handleRemove(u.id)}
                    className="text-ig-text text-xs font-semibold px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {removingId === u.id ? "Menghapus..." : "Hapus"}
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
