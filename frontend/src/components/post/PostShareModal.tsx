import React from "react";
import { X } from "lucide-react";
import { Avatar } from "../common/Avatar";

interface UserItem {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
}

interface PostShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareSearch: string;
  onShareSearchChange: (value: string) => void;
  followingUsers: UserItem[];
  allUsers: UserItem[];
  sentUserIds: Set<string>;
  onSendPost: (targetUsername: string, targetId: string) => void;
  isShareListLoading: boolean;
  currentUserId?: string;
  onCopyLink: () => void;
}

export const PostShareModal: React.FC<PostShareModalProps> = ({
  isOpen,
  onClose,
  shareSearch,
  onShareSearchChange,
  followingUsers,
  allUsers,
  sentUserIds,
  onSendPost,
  isShareListLoading,
  currentUserId,
  onCopyLink,
}) => {
  if (!isOpen) return null;

  const followingIds = new Set(followingUsers.map((u) => u.id));
  const filteredAllUsers = allUsers.filter((u) => u.id !== currentUserId);
  const followed = filteredAllUsers.filter((u) => followingIds.has(u.id));
  const others = filteredAllUsers.filter((u) => !followingIds.has(u.id));
  const shareList = [...followed, ...others];

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-ig-secondary-bg border border-ig-border rounded-xl w-full max-w-[480px] h-[550px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl text-left">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-ig-border">
          <span className="font-bold text-ig-text text-base">Bagikan</span>
          <button
            onClick={onClose}
            className="text-ig-text hover:text-ig-secondary-text p-1 rounded-full hover:bg-ig-elevated-bg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-ig-border">
          <input
            type="text"
            value={shareSearch}
            onChange={(e) => onShareSearchChange(e.target.value)}
            placeholder="Cari pengguna..."
            className="w-full bg-ig-elevated-bg border border-ig-border rounded-lg px-3 py-1.5 text-sm text-ig-text placeholder-ig-secondary-text focus:outline-none focus:ring-1 focus:ring-ig-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isShareListLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-ig-elevated-bg" />
                    <div className="space-y-1">
                      <div className="h-3 bg-ig-elevated-bg w-24 rounded" />
                      <div className="h-2 bg-ig-elevated-bg w-16 rounded" />
                    </div>
                  </div>
                  <div className="h-7 w-12 bg-ig-elevated-bg rounded-lg" />
                </div>
              ))}
            </div>
          ) : shareList.length === 0 ? (
            <div className="text-center text-ig-secondary-text text-sm py-8">
              Pengguna tidak ditemukan
            </div>
          ) : (
            shareList.map((targetUser) => {
              const isSent = sentUserIds.has(targetUser.id);
              const isFollowingThisUser = followingIds.has(targetUser.id);
              return (
                <div key={targetUser.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={targetUser.name}
                      avatarUrl={targetUser.avatarUrl}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-ig-text truncate">
                          {targetUser.username}
                        </span>
                        {isFollowingThisUser && (
                          <span className="text-[10px] bg-ig-elevated-bg text-ig-secondary-text px-1.5 py-0.5 rounded-full font-medium">
                            Mengikuti
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-ig-secondary-text truncate block">
                        {targetUser.name}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => !isSent && onSendPost(targetUser.username, targetUser.id)}
                    disabled={isSent}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isSent
                        ? "bg-ig-elevated-bg text-ig-secondary-text cursor-default"
                        : "bg-ig-primary hover:bg-blue-500 text-white"
                    }`}
                  >
                    {isSent ? "Terkirim" : "Kirim"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-ig-border">
          <button
            onClick={onCopyLink}
            className="w-full bg-ig-primary hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Salin Link Postingan
          </button>
        </div>
      </div>
    </div>
  );
};
