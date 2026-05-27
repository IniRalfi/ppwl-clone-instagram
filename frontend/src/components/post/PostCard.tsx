import React, { useState, useRef, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  UserPlus,
  Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Avatar } from "../common/Avatar";
import { useNavigate } from "react-router-dom";
import { toggleLike } from "../../services/like.service";
import { apiClient } from "../../services/api.client";
import { toast } from "sonner";

interface PostTag {
  username: string;
  x: number;
  y: number;
}

interface PostCardProps {
  id: string;
  /** ID author — untuk fetch follow stats & tombol follow */
  authorId: string;
  username: string;
  avatarUrl: string;
  imageUrls: string[];
  caption: string;
  likesCount: number;
  commentsCount?: number;
  timeAgo: string;
  postsCount: number;
  followers: number;
  following: number;
  bio: string;
  tags?: PostTag[];
  currentUserId?: string;
  isLikedByMe?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  authorId,
  username,
  avatarUrl,
  imageUrls,
  caption,
  likesCount,
  commentsCount = 0,
  timeAgo,
  postsCount,
  followers,
  following,
  bio,
  tags = [],
  currentUserId,
  isLikedByMe = false,
}) => {
  const navigate = useNavigate();
  const [showTags, setShowTags] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [currentLikeCount, setCurrentLikeCount] = useState(likesCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // ── Hover card state ──
  const [hoverStats, setHoverStats] = useState<{
    postsCount: number;
    followers: number;
    following: number;
  } | null>(null);
  const [isHoverFollowed, setIsHoverFollowed] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [hoverPosts, setHoverPosts] = useState<
    { id: string; imageUrl: string | null; content: string }[]
  >([]);
  const [isHoverStatsLoading, setIsHoverStatsLoading] = useState(false);
  const hoverFetchedRef = useRef(false);
  const hoverTimeoutRef = useRef<any>(null);

  const maxLength = 60;
  const shouldTruncate = caption.length > maxLength;
  const displayedCaption =
    isExpanded || !shouldTruncate ? caption : `${caption.substring(0, maxLength)}...`;

  // ── Like ──
  const handleLikeToggle = async () => {
    if (!currentUserId) {
      toast.error("Login dulu untuk memberi like!");
      return;
    }
    if (isLikeLoading) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setCurrentLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    setIsLikeLoading(true);
    try {
      const res = await toggleLike(id, currentUserId);
      setIsLiked(res.liked);
      setCurrentLikeCount(res.likeCount);
    } catch {
      setIsLiked(!newLiked);
      setCurrentLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
      toast.error("Gagal memberi like. Coba lagi.");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDoubleClick = () => {
    if (currentUserId && !isLiked) handleLikeToggle();
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 1500);
  };

  // ── Carousel ──
  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.clientWidth * index,
        behavior: "smooth",
      });
      setCurrentImgIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && !isDown.current) {
      const index = Math.round(
        scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth
      );
      if (index !== currentImgIndex) setCurrentImgIndex(index);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageUrls.length <= 1 || !scrollContainerRef.current) return;
    isDown.current = true;
    setIsDragging(true);
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    if (!isDown.current || !scrollContainerRef.current) return;
    isDown.current = false;
    setIsDragging(false);
    scrollToImage(
      Math.round(scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth)
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    scrollContainerRef.current.scrollLeft =
      scrollLeft.current - (e.pageX - scrollContainerRef.current.offsetLeft - startX.current) * 1.2;
  };

  // ── Hover card: fetch stats saat pertama hover ──
  const handleHoverEnter = useCallback(async () => {
    if (hoverFetchedRef.current) return;
    hoverFetchedRef.current = true;
    setIsHoverStatsLoading(true);
    try {
      const params = currentUserId ? `?currentUserId=${currentUserId}` : "";

      const [statsRes, postsRes] = await Promise.all([
        apiClient.get<{
          followers: number;
          following: number;
          isFollowing: boolean;
        }>(`/follow/stats/${authorId}${params}`),
        apiClient.get<{
          data: { id: string; imageUrl: string | null; content: string }[];
        }>(`/posts?authorId=${authorId}&limit=3`),
      ]);

      setHoverStats({
        followers: statsRes.followers,
        following: statsRes.following,
        postsCount,
      });
      setIsHoverFollowed(statsRes.isFollowing);

      if (postsRes && postsRes.data) {
        setHoverPosts(postsRes.data);
      }
    } catch {
      setHoverStats({
        followers,
        following,
        postsCount,
      });
    } finally {
      setIsHoverStatsLoading(false);
    }
  }, [authorId, currentUserId, followers, following, postsCount]);

  // Debounce hover trigger to avoid connection pool flooding
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      handleHoverEnter();
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // ── Follow dari hover card ──
  const handleHoverFollow = async () => {
    if (!currentUserId || isFollowLoading || isHoverFollowed || currentUserId === authorId) return;
    setIsFollowLoading(true);
    try {
      await apiClient.post("/follow", { followerId: currentUserId, followingId: authorId });
      setIsHoverFollowed(true);
      setHoverStats((prev) => (prev ? { ...prev, followers: prev.followers + 1 } : prev));
      toast.success(`Kamu mengikuti @${username} 🎉`);
    } catch {
      toast.error("Gagal mengikuti pengguna. Coba lagi.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // ── Hover card component ──
  const renderHoverCard = (isFooter = false) => (
    <div
      onMouseEnter={handleHoverEnter}
      className={`absolute left-0 w-[300px] bg-ig-secondary-bg border border-ig-border rounded-xl p-4 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 text-left normal-case font-normal ${
        isFooter ? "bottom-6" : "top-6"
      }`}
    >
      {/* Avatar + Username */}
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

      {/* Stats: posts / followers / following */}
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

      {/* 3 postingan terakhir (seperti IG asli) */}
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

      {/* Tombol Follow — disembunyikan jika post milik sendiri */}
      {currentUserId && currentUserId !== authorId && (
        <button
          onClick={handleHoverFollow}
          disabled={isFollowLoading || isHoverFollowed || isHoverStatsLoading}
          className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2 rounded-lg transition-all border-none cursor-pointer ${
            isHoverFollowed
              ? "bg-ig-elevated-bg text-ig-secondary-text cursor-default"
              : "bg-ig-primary hover:bg-blue-500 text-white"
          } disabled:opacity-60`}
        >
          {isHoverFollowed ? (
            <>
              <Check className="h-4 w-4" /> Following
            </>
          ) : isFollowLoading ? (
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

  return (
    <Card className="post-card w-full border-none bg-ig-background text-ig-text rounded-none sm:rounded-lg overflow-hidden text-left relative">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-3 relative">
        <div className="flex items-center space-x-3">
          <Avatar
            avatarUrl={avatarUrl}
            name={username}
            size="sm"
            className="border border-ig-border"
          />
          <div
            className="flex items-baseline space-x-2 relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span className="font-semibold text-[14px] text-ig-text hover:text-ig-secondary-text cursor-pointer">
              {username}
            </span>
            <span className="text-xs text-ig-secondary-text">• {timeAgo}</span>
            {renderHoverCard(false)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent rounded-full h-8 w-8 p-0 flex items-center justify-center"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* ── CAROUSEL GAMBAR ── */}
      <div
        className="relative w-full overflow-hidden bg-black flex items-center justify-center aspect-[4/5]"
        onDoubleClick={handleDoubleClick}
        onClick={() => setShowTags(!showTags)}
      >
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className={`w-full h-full flex overflow-x-auto scrollbar-none select-none ${
            isDragging ? "scroll-auto" : "snap-x snap-mandatory scroll-smooth"
          } ${imageUrls.length > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
          style={{ scrollbarWidth: "none" }}
        >
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center pointer-events-none relative"
            >
              <img
                src={url}
                alt={`Postingan ke-${index + 1}`}
                className="w-full h-full object-cover select-none"
                draggable="false"
              />
              {index === 0 &&
                showTags &&
                tags.map((tag, tIdx) => (
                  <div
                    key={tIdx}
                    className="absolute bg-ig-background/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg pointer-events-auto border border-ig-border animate-in fade-in zoom-in-95 duration-150"
                    style={{ left: `${tag.x}%`, top: `${tag.y}%`, transform: "translate(-50%, 0)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info(`Membuka profil @${tag.username}...`);
                    }}
                  >
                    <span className="cursor-pointer hover:underline">{tag.username}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {tags.length > 0 && (
          <button
            className={`absolute bottom-3 left-3 p-2 rounded-full transition-all duration-200 z-20 border-none cursor-pointer flex items-center justify-center backdrop-blur-sm ${
              showTags
                ? "bg-blue-500 text-white scale-105"
                : "bg-black/60 text-white/90 hover:bg-black/80 hover:scale-105"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowTags(!showTags);
            }}
          >
            <User className="h-4 w-4 fill-current" />
          </button>
        )}

        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none animate-in fade-in zoom-in-50">
            <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
          </div>
        )}

        {imageUrls.length > 1 && (
          <>
            {currentImgIndex > 0 && (
              <button
                onClick={() => scrollToImage(currentImgIndex - 1)}
                className="absolute left-3 p-1 rounded-full bg-zinc-900/40 text-white/70 hover:bg-zinc-900/70 hover:text-white border-none cursor-pointer flex items-center justify-center z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {currentImgIndex < imageUrls.length - 1 && (
              <button
                onClick={() => scrollToImage(currentImgIndex + 1)}
                className="absolute right-3 p-1 rounded-full bg-zinc-900/40 text-white/70 hover:bg-zinc-900/70 hover:text-white border-none cursor-pointer flex items-center justify-center z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 pointer-events-none z-10">
              {imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === currentImgIndex ? "bg-blue-500 w-2" : "bg-zinc-500/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER: TOMBOL + CAPTION ── */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like */}
            <div className="flex items-center space-x-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeToggle}
                disabled={isLikeLoading}
                className={`h-7 w-7 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 ${
                  isLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-ig-text hover:text-ig-secondary-text"
                }`}
              >
                <Heart
                  className={`h-6 w-6 transition-all duration-150 ${isLiked ? "fill-current scale-110" : ""}`}
                />
              </Button>
              <span className="text-sm font-semibold select-none text-ig-secondary-text">
                {currentLikeCount > 1000
                  ? `${(currentLikeCount / 1000).toFixed(1)}K`
                  : currentLikeCount}
              </span>
            </div>

            {/* Comment */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button
                onClick={() => navigate(`/posts/${id}`)}
                variant="ghost"
                size="icon"
                className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-7 w-7 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              <span className="text-sm font-semibold select-none text-ig-secondary-text">
                {commentsCount}
              </span>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button
                variant="ghost"
                size="icon"
                className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-7 w-7 p-0 flex items-center justify-center rotate-[-20deg] transition-transform active:scale-75 hover:scale-110 duration-150"
              >
                <Send className="h-6 w-6" />
              </Button>
              <span className="text-sm font-semibold select-none text-ig-secondary-text">0</span>
            </div>
          </div>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`h-7 w-7 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 hover:scale-110 duration-150 ${
              isBookmarked ? "text-ig-text" : "text-ig-text hover:text-ig-secondary-text"
            }`}
          >
            <Bookmark
              className={`h-6 w-6 transition-all duration-150 ${isBookmarked ? "fill-current scale-110" : ""}`}
            />
          </Button>
        </div>

        {/* Caption */}
        <div className="text-[13.5px] leading-relaxed pt-1 border-t border-ig-border relative">
          <div>
            <span
              className="inline-block relative group mr-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="font-semibold cursor-pointer text-ig-text hover:underline text-[13.5px]">
                {username}
              </span>
              {renderHoverCard(true)}
            </span>
            <span className="text-ig-text whitespace-pre-wrap">{displayedCaption}</span>
            {shouldTruncate && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-ig-secondary-text font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block"
              >
                ... more
              </button>
            )}
            {isExpanded && shouldTruncate && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-ig-secondary-text text-xs font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block"
              >
                (less)
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
