import { Avatar } from "../common/Avatar";
import { UserPlus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HoverPost {
  id: string;
  imageUrl: string | null;
  content: string;
}

interface PostHoverCardProps {
  username: string;
  avatarUrl: string;
  bio: string;
  postsCount: number;
  followers: number;
  following: number;
  hoverPosts: HoverPost[];
  isHoverStatsLoading: boolean;
  isAuthorFollowed: boolean;
  isHoverFollowLoading: boolean;
  onHoverFollow: () => void;
  onHoverEnter: () => void;
  userId: string;
  currentUserId?: string;
  isFooter?: boolean;
  hoverStats?: {
    postsCount: number;
    followers: number;
    following: number;
  } | null;
}

export const PostHoverCard: React.FC<PostHoverCardProps> = ({
  username,
  avatarUrl,
  bio,
  postsCount,
  followers,
  following,
  hoverPosts,
  isHoverStatsLoading,
  isAuthorFollowed,
  isHoverFollowLoading,
  onHoverFollow,
  onHoverEnter,
  userId,
  currentUserId,
  isFooter = false,
  hoverStats,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={onHoverEnter}
      className={`absolute left-0 w-[300px] bg-ig-secondary-bg border border-ig-border rounded-xl p-4 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 text-left normal-case font-normal ${
        isFooter ? "bottom-6" : "top-6"
      }`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Avatar
          avatarUrl={avatarUrl}
          name={username}
          className="h-14 w-14 border border-ig-border"
        />
        <div>
          <div className="font-bold text-ig-text text-[15px]">{username}</div>
          <div className="text-xs text-ig-secondary-text max-w-[180px] truncate">{bio}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center border-t border-b border-ig-border py-3 mb-4">
        <div>
          <div className="font-bold text-sm text-ig-text flex justify-center">
            {isHoverStatsLoading ? (
              <div className="h-4 w-8 bg-neutral-700 animate-pulse rounded my-0.5" />
            ) : hoverStats ? (
              hoverStats.postsCount
            ) : (
              postsCount
            )}
          </div>
          <div className="text-[11px] text-ig-secondary-text">posts</div>
        </div>
        <div>
          <div className="font-bold text-sm text-ig-text flex justify-center">
            {isHoverStatsLoading ? (
              <div className="h-4 w-8 bg-neutral-700 animate-pulse rounded my-0.5" />
            ) : hoverStats ? (
              hoverStats.followers
            ) : (
              followers
            )}
          </div>
          <div className="text-[11px] text-ig-secondary-text">followers</div>
        </div>
        <div>
          <div className="font-bold text-sm text-ig-text flex justify-center">
            {isHoverStatsLoading ? (
              <div className="h-4 w-8 bg-neutral-700 animate-pulse rounded my-0.5" />
            ) : hoverStats ? (
              hoverStats.following
            ) : (
              following
            )}
          </div>
          <div className="text-[11px] text-ig-secondary-text">following</div>
        </div>
      </div>

      {isHoverStatsLoading ? (
        <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-ig-border">
          <div className="aspect-square bg-neutral-800 animate-pulse rounded-xs" />
          <div className="aspect-square bg-neutral-800 animate-pulse rounded-xs" />
          <div className="aspect-square bg-neutral-800 animate-pulse rounded-xs" />
        </div>
      ) : hoverPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-ig-border">
          {hoverPosts.map((hp) => (
            <div
              key={hp.id}
              className="aspect-square bg-neutral-800 rounded-xs overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/posts/${hp.id}`);
              }}
            >
              {hp.imageUrl ? (
                <img
                  src={hp.imageUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] text-ig-secondary-text p-1 text-center truncate">
                  {hp.content}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {currentUserId && currentUserId !== userId && (
        <button
          onClick={onHoverFollow}
          disabled={isHoverFollowLoading || isAuthorFollowed || isHoverStatsLoading}
          className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2 rounded-lg transition-all border-none cursor-pointer ${
            isAuthorFollowed
              ? "bg-ig-elevated-bg text-ig-secondary-text cursor-default"
              : "bg-ig-primary hover:bg-blue-500 text-white"
          } disabled:opacity-60`}
        >
          {isAuthorFollowed ? (
            <>
              <Check className="h-4 w-4" /> Following
            </>
          ) : isHoverFollowLoading ? (
            "..."
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Follow
            </>
          )}
        </button>
      )}
    </div>
  );
};
