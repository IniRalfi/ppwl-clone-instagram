import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { toggleLike } from "../../services/like.service";
import { apiClient } from "../../services/api.client";
import type { PostTag } from "../../lib/mockData";
import { PostHeader } from "./PostHeader";
import { PostCarousel } from "./PostCarousel";
import { PostActions } from "./PostActions";
import { PostCaption } from "./PostCaption";
import { PostHoverCard } from "./PostHoverCard";
import { PostOptionsModal } from "./PostOptionsModal";
import { PostShareModal } from "./PostShareModal";

interface PostCardProps {
  id: string;
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
    toast.success(`Berhasil mengirim postingan ke @${targetUsername}! 🚀`);
  };

  const maxLength = 60;
  const shouldTruncate = currentCaption.length > maxLength;
  const displayedCaption =
    isExpanded || !shouldTruncate ? currentCaption : `${currentCaption.substring(0, maxLength)}...`;

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

  const renderHoverCard = (isFooter: boolean) => (
    <PostHoverCard
      username={username}
      avatarUrl={avatarUrl}
      bio={bio}
      postsCount={postsCount}
      followers={followers}
      following={following}
      hoverPosts={hoverPosts}
      isHoverStatsLoading={isHoverStatsLoading}
      isAuthorFollowed={isHoverFollowed}
      isHoverFollowLoading={isFollowLoading}
      onHoverFollow={handleHoverFollow}
      onHoverEnter={handleHoverEnter}
      userId={authorId}
      currentUserId={currentUserId}
      isFooter={isFooter}
      hoverStats={hoverStats}
    />
  );

  if (isDeleted) return null;

  return (
    <div className="w-full bg-transparent text-ig-text text-left relative pb-8 mb-4 border-b border-ig-separator">
      <PostHeader
        username={username}
        avatarUrl={avatarUrl}
        timeAgo={timeAgo}
        onUsernameClick={handleUsernameClick}
        onToggleOptions={() => setShowOptionsModal(true)}
        hoverCard={renderHoverCard(false)}
        onHoverGroupEnter={handleMouseEnter}
        onHoverGroupLeave={handleMouseLeave}
      />

      <PostCarousel
        imageUrls={imageUrls}
        tags={tags}
        currentImgIndex={currentImgIndex}
        showTags={showTags}
        onToggleTags={() => setShowTags(!showTags)}
        onScrollToImage={scrollToImage}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        isDragging={isDragging}
        scrollContainerRef={scrollContainerRef}
        onDoubleClick={handleDoubleClick}
        showHeartPop={showHeartPop}
      />

      <div className="px-0 py-3 space-y-2.5">
        <PostActions
          isLiked={isLiked}
          onLikeToggle={handleLikeToggle}
          isLikeLoading={isLikeLoading}
          isBookmarked={isBookmarked}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarkLoading={isBookmarkLoading}
          onShareClick={() => setShowShareModal(true)}
          currentLikeCount={currentLikeCount}
          commentsCount={commentsCount}
          onCommentClick={() => navigate(`/posts/${id}`)}
        />

        <PostCaption
          caption={currentCaption}
          username={username}
          isExpanded={isExpanded}
          shouldTruncate={shouldTruncate}
          displayedCaption={displayedCaption}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          isEditing={isEditing}
          editContent={editContent}
          onEditChange={setEditContent}
          onEditSave={handleEditCaption}
          onEditCancel={() => {
            setIsEditing(false);
            setEditContent(currentCaption);
          }}
          isEditLoading={isEditLoading}
          commentsCount={commentsCount}
          onCommentsClick={() => navigate(`/posts/${id}`)}
          onUsernameClick={handleUsernameClick}
          hoverCard={renderHoverCard(true)}
          onHoverGroupEnter={handleMouseEnter}
          onHoverGroupLeave={handleMouseLeave}
        />
      </div>

      <PostOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        isOwnPost={authorId === currentUserId}
        isAuthorFollowed={isAuthorFollowed}
        isBookmarked={isBookmarked}
        onUnfollow={handleUnfollowAuthor}
        onDelete={handleDeletePost}
        onCopyLink={handleCopyLink}
        onToggleBookmark={handleBookmarkToggle}
        onEditCaption={() => setIsEditing(true)}
        onShareClick={() => setShowShareModal(true)}
      />

      <PostShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareSearch={shareSearch}
        onShareSearchChange={setShareSearch}
        followingUsers={followingUsers}
        allUsers={allUsers}
        sentUserIds={sentUserIds}
        onSendPost={handleSendPost}
        isShareListLoading={isShareListLoading}
        currentUserId={currentUserId}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
};

export default PostCard;
