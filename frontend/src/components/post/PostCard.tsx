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
  isBookmarkedByMe?: boolean;
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
  isBookmarkedByMe = false,
}) => {
  const navigate = useNavigate();
  const [showTags, setShowTags] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [currentLikeCount, setCurrentLikeCount] = useState(likesCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedByMe);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

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

  const handleBookmarkToggle = async () => {
    if (!currentUserId) {
      toast.error("Login dulu untuk menyimpan postingan!");
      return;
    }
    if (isBookmarkLoading) return;
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    setIsBookmarkLoading(true);
    try {
      const res = await apiClient.post<{ bookmarked: boolean }>(`/posts/${id}/bookmark`, {});
      setIsBookmarked(res.bookmarked);
      if (res.bookmarked) {
        toast.success("Postingan berhasil disimpan!");
      } else {
        toast.success("Batal menyimpan postingan.");
      }
    } catch {
      setIsBookmarked(!newBookmarked);
      toast.error("Gagal menyimpan postingan. Coba lagi.");
    } finally {
      setIsBookmarkLoading(false);
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
    if (hoverStats || isHoverStatsLoading) return;
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
  }, [authorId, currentUserId, followers, following, postsCount, hoverStats, isHoverStatsLoading]);

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
    <div className="w-full bg-transparent text-ig-text text-left relative pb-8 mb-4 border-b border-ig-separator">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-0 pb-3 relative">
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
          className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent rounded-full h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* ── CAROUSEL GAMBAR (dengan border & rounded tipis seperti screenshot) ── */}
      <div
        className="relative w-full overflow-hidden bg-black flex items-center justify-center aspect-[4/5] rounded-[4px] border border-ig-border"
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
                className="w-full h-full object-contain bg-black select-none"
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
      <div className="px-0 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeToggle}
                disabled={isLikeLoading}
                className={`h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 cursor-pointer ${
                  isLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-ig-text hover:text-ig-secondary-text"
                }`}
              >
                {isLiked ? (
                  <svg aria-label="Unlike" fill="#FF3040" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M21.35 9.122c0-3.072-2.65-4.959-5.197-7.222-2.512-2.243-3.865-3.469-4.303-3.752a.48.48 0 0 0-.51 0C10.9 1.433 9.547 2.66 7.035 4.9c-2.545 2.263-5.197 4.15-5.197 7.222 0 3.072 2.65 4.959 5.197 7.222 2.512 2.243 3.865 3.469 4.303 3.752.19.123.418.19.65.19s.46-.067.65-.19c.438-.283 1.791-1.509 4.303-3.752 2.545-2.263 5.197-4.15 5.197-7.222z"></path>
                  </svg>
                ) : (
                  <svg aria-label="Like" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752a.48.48 0 0 1-.51 0c-.438-.283-1.791-1.509-4.303-3.752C4.652 14.081 2 12.194 2 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.208.28.569.28.777 0a4.21 4.21 0 0 1 3.632-1.941M12 21.35l-.015-.01a.34.34 0 0 1-.03-.027c-.366-.237-1.764-1.488-4.254-3.71C5.228 15.385 2.5 13.5 2.5 9.122c0-3.419 2.52-5.468 4.958-5.468a4.7 4.7 0 0 1 3.67 1.916.75.75 0 0 0 1.2 0 4.7 4.7 0 0 1 3.67-1.916c2.438 0 4.958 2.049 4.958 5.468 0 4.378-2.728 6.263-5.216 8.48-2.49 2.222-3.888 3.473-4.254 3.71a.34.34 0 0 1-.03.027z"></path>
                  </svg>
                )}
              </Button>
              <span className="text-sm font-semibold select-none text-ig-text">
                {currentLikeCount}
              </span>
            </div>

            {/* Comment */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button
                onClick={() => navigate(`/posts/${id}`)}
                variant="ghost"
                size="icon"
                className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-8 w-8 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer"
              >
                <svg aria-label="Comment" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </Button>
              <span className="text-sm font-semibold select-none text-ig-text">
                {commentsCount}
              </span>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button
                variant="ghost"
                size="icon"
                className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-8 w-8 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer"
              >
                <svg aria-label="Share Post" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                  <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                  <polygon fill="none" points="11.698 20.334 22 3.001 2 10.263 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
                </svg>
              </Button>
              <span className="text-sm font-semibold select-none text-ig-text">0</span>
            </div>
          </div>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
            className={`h-8 w-8 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer ${
              isBookmarked ? "text-ig-text" : "text-ig-text hover:text-ig-secondary-text"
            }`}
          >
            {isBookmarked ? (
              <svg aria-label="Remove" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21"></polygon>
              </svg>
            ) : (
              <svg aria-label="Save" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon>
              </svg>
            )}
          </Button>
        </div>

        {/* Likes Count */}
        <div className="text-sm font-bold text-ig-text select-none">
          {currentLikeCount > 0
            ? `${currentLikeCount.toLocaleString("id-ID")} suka`
            : "Jadilah yang pertama menyukai ini"}
        </div>

        {/* Caption */}
        <div className="text-[13.5px] leading-relaxed relative">
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
                ... lainnya
              </button>
            )}
            {isExpanded && shouldTruncate && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-ig-secondary-text text-xs font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block"
              >
                (lebih sedikit)
              </button>
            )}
          </div>
        </div>

        {/* Link Komentar */}
        {commentsCount > 0 && (
          <div
            onClick={() => navigate(`/posts/${id}`)}
            className="text-[13.5px] text-ig-secondary-text cursor-pointer hover:underline pt-0.5 select-none"
          >
            Lihat semua {commentsCount} komentar
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
