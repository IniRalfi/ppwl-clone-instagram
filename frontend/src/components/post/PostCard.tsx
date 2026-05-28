import React, { useState, useRef, useCallback, useEffect } from "react";
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
  X,
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
  const [sharesCount, setSharesCount] = useState(() => {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 10) + 1; // Angka awal acak yang stabil antara 1 sampai 10
  });

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

  // ── Pembaruan Sempurna: Edit, Delete, Options, Share States ──
  const [currentCaption, setCurrentCaption] = useState(caption);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(caption);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isAuthorFollowed, setIsAuthorFollowed] = useState(false);

  const [shareSearch, setShareSearch] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [isShareListLoading, setIsShareListLoading] = useState(false);
  const [sentUserIds, setSentUserIds] = useState<Set<string>>(new Set());

  // Sinkronisasi status follow pembuat post
  useEffect(() => {
    if (currentUserId && authorId && currentUserId !== authorId) {
      apiClient.get<any>(`/follow/stats/${authorId}?currentUserId=${currentUserId}`)
        .then((res) => {
          const stats = res.data || res;
          setIsAuthorFollowed(stats.isFollowing);
          setIsHoverFollowed(stats.isFollowing);
        })
        .catch(() => {});
    }
  }, [currentUserId, authorId]);

  useEffect(() => {
    setCurrentLikeCount(likesCount);
  }, [likesCount]);

  // Fetch daftar pengguna untuk dishare
  useEffect(() => {
    if (showShareModal && currentUserId) {
      setIsShareListLoading(true);
      Promise.all([
        apiClient.get<any>(`/follow/following/${currentUserId}`).catch(() => ({ data: [] })),
        apiClient.get<any>(`/users?search=${shareSearch}`).catch(() => ({ data: [] })),
      ]).then(([followingRes, allRes]) => {
        const following = followingRes.data?.data || followingRes.data || [];
        const all = allRes.data?.data || allRes.data || [];
        setFollowingUsers(following);
        setAllUsers(all);
      }).finally(() => {
        setIsShareListLoading(false);
      });
    }
  }, [showShareModal, currentUserId, shareSearch]);

  const handleUsernameClick = () => {
    if (authorId === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/profile/${username}`);
    }
  };

  const handleEditCaption = async () => {
    if (!editContent.trim()) return;
    setIsEditLoading(true);
    try {
      await apiClient.put(`/posts/${id}`, { content: editContent });
      setCurrentCaption(editContent);
      setIsEditing(false);
      toast.success("Caption berhasil diperbarui! 🎉");
    } catch {
      toast.error("Gagal memperbarui caption.");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus postingan ini?");
    if (!confirmDelete) return;
    try {
      await apiClient.delete(`/posts/${id}`);
      setIsDeleted(true);
      toast.success("Postingan berhasil dihapus! 🗑️");
      setShowOptionsModal(false);
    } catch {
      toast.error("Gagal menghapus postingan.");
    }
  };

  const handleUnfollowAuthor = async () => {
    const confirmUnfollow = window.confirm(`Batal mengikuti @${username}?`);
    if (!confirmUnfollow) return;
    try {
      await apiClient.delete("/follow", {
        data: {
          followerId: currentUserId,
          followingId: authorId,
        }
      });
      setIsAuthorFollowed(false);
      setIsHoverFollowed(false);
      toast.success(`Batal mengikuti @${username}`);
      setShowOptionsModal(false);
    } catch {
      toast.error("Gagal batal mengikuti.");
    }
  };

  const handleCopyLink = () => {
    const postLink = `${window.location.origin}/posts/${id}`;
    navigator.clipboard.writeText(postLink);
    toast.success("Tautan disalin ke papan klip! 📋");
    setShowOptionsModal(false);
  };

  const handleSendPost = (targetUsername: string, targetId: string) => {
    setSentUserIds((prev) => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });
    setSharesCount((prev) => prev + 1);
    toast.success(`Berhasil mengirim postingan ke @${targetUsername}! 🚀`);
  };

  const followingIds = new Set(followingUsers.map((u) => u.id));
  const filteredAllUsers = allUsers.filter((u) => u.id !== currentUserId);
  const followed = filteredAllUsers.filter((u) => followingIds.has(u.id));
  const others = filteredAllUsers.filter((u) => !followingIds.has(u.id));
  const shareList = [...followed, ...others];

  const maxLength = 60;
  const shouldTruncate = currentCaption.length > maxLength;
  const displayedCaption =
    isExpanded || !shouldTruncate ? currentCaption : `${currentCaption.substring(0, maxLength)}...`;

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

  if (isDeleted) return null;

  return (
    <div className="w-full bg-transparent text-ig-text text-left relative pb-8 mb-4 border-b border-ig-separator">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-0 pb-3 relative">
        <div className="flex items-center space-x-3">
          <div onClick={handleUsernameClick} className="cursor-pointer">
            <Avatar
              avatarUrl={avatarUrl}
              name={username}
              size="sm"
              className="border border-ig-border"
            />
          </div>
          <div
            className="flex items-baseline space-x-2 relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span 
              onClick={handleUsernameClick}
              className="font-semibold text-[14px] text-ig-text hover:text-ig-secondary-text cursor-pointer"
            >
              {username}
            </span>
            <span className="text-xs text-ig-secondary-text">• {timeAgo}</span>
            {renderHoverCard(false)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowOptionsModal(true)}
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
                className={`h-12 w-12 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 cursor-pointer ${
                  isLiked
                    ? "text-[#ed4956] hover:text-[#FF3040]"
                    : "text-ig-text hover:text-ig-secondary-text"
                }`}
              >
                {isLiked ? (
                  <svg aria-label="Unlike" fill="#ed4956" stroke="#ed4956" strokeWidth="1" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                ) : (
                  <svg aria-label="Like" fill="none" stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
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
                className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-12 w-12 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer"
              >
                <svg aria-label="Comment" fill="none" stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </Button>
              <span className="text-sm font-semibold select-none text-ig-text">
                {commentsCount}
              </span>
            </div>

            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShareModal(true)}
              className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-12 w-12 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer"
            >
              <svg aria-label="Share Post" fill="none" stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </Button>
          </div>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
            className={`h-12 w-12 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer ${
              isBookmarked ? "text-ig-text" : "text-ig-text hover:text-ig-secondary-text"
            }`}
          >
            <svg aria-label="Save" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
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
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-ig-elevated-bg border border-ig-border text-ig-text rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ig-primary resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(currentCaption);
                  }}
                  disabled={isEditLoading}
                  className="text-xs text-ig-secondary-text hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleEditCaption}
                  disabled={isEditLoading || !editContent.trim()}
                  className="text-xs bg-ig-primary text-white hover:bg-blue-500"
                >
                  {isEditLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <span
                className="inline-block relative group mr-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span 
                  onClick={handleUsernameClick}
                  className="font-semibold cursor-pointer text-ig-text hover:underline text-[13.5px]"
                >
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
          )}
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

      {/* ── MODAL PILIHAN (THREE DOTS MENU) ── */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-ig-secondary-bg border border-ig-border rounded-xl w-full max-w-[400px] overflow-hidden flex flex-col text-center divide-y divide-ig-separator shadow-2xl">
            {authorId !== currentUserId ? (
              <>
                {isAuthorFollowed && (
                  <button
                    onClick={handleUnfollowAuthor}
                    className="w-full text-red-500 font-bold hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
                  >
                    Batal Mengikuti
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleDeletePost}
                  className="w-full text-red-500 font-bold hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
                >
                  Hapus Postingan
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowOptionsModal(false);
                  }}
                  className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
                >
                  Edit Caption
                </button>
              </>
            )}
            <button
              onClick={() => {
                handleBookmarkToggle();
                setShowOptionsModal(false);
              }}
              className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              {isBookmarked ? "Batalkan Simpan" : "Simpan Postingan"}
            </button>
            <button
              onClick={() => {
                setShowShareModal(true);
                setShowOptionsModal(false);
              }}
              className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              Bagikan...
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              Salin Tautan
            </button>
            <button
              onClick={() => setShowOptionsModal(false)}
              className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL SHARE (KIRIM KE PENGGUNA) ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-ig-secondary-bg border border-ig-border rounded-xl w-full max-w-[480px] h-[550px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl text-left">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-ig-border">
              <span className="font-bold text-ig-text text-base">Bagikan</span>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-ig-text hover:text-ig-secondary-text p-1 rounded-full hover:bg-ig-elevated-bg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="px-4 py-2 border-b border-ig-border">
              <input
                type="text"
                value={shareSearch}
                onChange={(e) => setShareSearch(e.target.value)}
                placeholder="Cari pengguna..."
                className="w-full bg-ig-elevated-bg border border-ig-border rounded-lg px-3 py-1.5 text-sm text-ig-text placeholder-ig-secondary-text focus:outline-none focus:ring-1 focus:ring-ig-primary"
              />
            </div>

            {/* List Pengguna */}
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
                        onClick={() => !isSent && handleSendPost(targetUser.username, targetUser.id)}
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

            {/* Tombol Salin Link di Bawah */}
            <div className="p-4 border-t border-ig-border">
              <button
                onClick={handleCopyLink}
                className="w-full bg-ig-primary hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Salin Link Postingan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
