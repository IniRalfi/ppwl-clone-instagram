import { useEffect, useMemo, useRef, useState } from "react";
import type { Comment } from "../../../shared/src/types/comment";
import { CommentItem } from "../components/comment/CommentItem";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth.store";
import { apiClient } from "../services/api.client";
import { Smile, Loader2, MoreHorizontal } from "lucide-react";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import { useThemeStore } from "../store/theme.store";
import { usePublicRealtime } from "../hooks/usePublicRealtime";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  comments?: Comment[];
  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  commentsNextCursor?: string | null;
}

function buildCommentTree(flatComments: Comment[]): Comment[] {
  const commentMap: { [key: string]: Comment } = {};
  
  // Inisialisasi map dengan array replies kosong
  flatComments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  const roots: Comment[] = [];

  flatComments.forEach((c) => {
    const mappedComment = commentMap[c.id];
    if (c.parentId) {
      const parent = commentMap[c.parentId];
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(mappedComment);
      } else {
        roots.push(mappedComment);
      }
    } else {
      roots.push(mappedComment);
    }
  });

  return roots;
}

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const currentTheme = useThemeStore((state) => state.theme);

  // State reply: null = komentar baru, isi = sedang balas komentar tertentu
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    username: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const commentListRef = useRef<HTMLDivElement>(null);
  
  // Mengambil user aktif dari auth store
  const currentUser = useAuthStore((state) => state.user);

  // PERF-04: Memoize comment tree agar tidak dibangun ulang tiap render
  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const json = await apiClient.get<{ data: Post }>(`/posts/${id}`);
        if (json && json.data) {
          setPost(json.data);
          setComments(json.data.comments || []);
          setIsBookmarked(!!json.data.isBookmarkedByMe);
          setNextCursor(json.data.commentsNextCursor || null);
        } else {
          toast.error("Gagal memuat detail postingan.");
          navigate('/');
        }
      } catch (error) {
        toast.error("Kesalahan jaringan.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPostData();
  }, [id, navigate]);

  usePublicRealtime({
    onCommentCreated: ({ postId, comment }) => {
      if (postId !== id) return;

      setComments((prev) => {
        if (prev.some((item) => item.id === comment.id)) return prev;
        return [comment, ...prev];
      });
    },
  });

  // Dipanggil saat klik "Balas" di CommentItem
  const handleReplyClick = (parentId: string, username: string) => {
    setReplyTarget({ parentId, username });
    setInputValue(`@${username} `);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
    setInputValue("");
  };

  // Submit — bisa komentar baru atau reply
  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting || !currentUser) return;
    setIsSubmitting(true);

    try {
      const json = await apiClient.post<{ data: any }>("/comments", {
        postId: id,
        content: inputValue.trim(),
        parentId: replyTarget?.parentId ?? null,
        authorId: currentUser.id,
      });

      if (json?.data) {
        // BUG-07: Gunakan response POST langsung, tidak perlu fetch ulang
        setComments((prev) => [json.data, ...prev]);
        setInputValue("");
        setReplyTarget(null);
        toast.success("Komentar berhasil ditambahkan.");
      } else {
        toast.error("Gagal mengirim komentar.");
      }
    } catch {
      toast.error("Kesalahan jaringan atau sesi telah berakhir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape" && replyTarget) handleCancelReply();
  };

  const handleBookmarkToggle = async () => {
    if (!currentUser || !post) return;
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    try {
      const res = await apiClient.post<{ bookmarked: boolean }>(`/posts/${post.id}/bookmark`, {});
      if (res) {
        setIsBookmarked(res.bookmarked);
        toast.success(res.bookmarked ? "Postingan berhasil disimpan! 💾" : "Batal menyimpan postingan.");
      }
    } catch {
      setIsBookmarked(!newBookmarked);
      toast.error("Gagal memperbarui status simpan.");
    }
  };

  const handleCopyLink = () => {
    if (!post) return;
    const postLink = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(postLink);
    toast.success("Tautan disalin ke papan klip! 📋");
    setShowOptionsModal(false);
  };

  const handleDeletePost = async () => {
    if (!post) return;
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus postingan ini?");
    if (!confirmDelete) return;
    try {
      await apiClient.delete(`/posts/${post.id}`);
      toast.success("Postingan berhasil dihapus! 🗑️");
      setShowOptionsModal(false);
      navigate('/');
    } catch {
      toast.error("Gagal menghapus postingan.");
    }
  };

  const handleScroll = async () => {
    const container = commentListRef.current;
    if (!container || !nextCursor || isFetchingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setIsFetchingMore(true);
      try {
        const json = await apiClient.get<{ data: { comments: Comment[]; nextCursor: string | null } }>(
          `/posts/${id}/comments?cursor=${nextCursor}&limit=15`
        );
        if (json && json.data) {
          setComments((prev) => [...prev, ...json.data.comments]);
          setNextCursor(json.data.nextCursor);
        }
      } catch {
        toast.error("Gagal memuat lebih banyak komentar.");
      } finally {
        setIsFetchingMore(false);
      }
    }
  };

  const canSubmit = inputValue.trim().length > 0 && !isSubmitting;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ig-background text-ig-text flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-10 h-10 text-ig-primary animate-spin" />
        <span className="text-xs text-ig-secondary-text font-medium tracking-wide animate-pulse">Memuat postingan...</span>
      </div>
    );
  }

  if (!post) {
    return <div className="min-h-screen bg-ig-background text-ig-text flex justify-center items-center">Postingan tidak ditemukan.</div>;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={() => navigate('/')}
    >
      {/* Tombol X (Close) */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[60]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Modal Content */}
      <div 
        className="w-full max-w-[1200px] flex flex-col md:flex-row bg-ig-background border border-ig-border md:h-[85vh] overflow-hidden rounded-md shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal tertutup
      >
        
        {/* KIRI: POST GAMBAR/KONTEN */}
        <div className="w-full md:w-[60%] flex items-center justify-center bg-black border-r border-ig-border overflow-hidden relative">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="Post" className="object-contain w-full h-full" />
          ) : (
            <div className="p-10 text-center text-lg">{post.content}</div>
          )}
        </div>

        {/* KANAN: KOMENTAR & INFO */}
        <div className="w-full md:w-[40%] flex flex-col h-full bg-ig-background relative">
          
          {/* Header Info User */}
          <div className="flex items-center justify-between p-4 border-b border-ig-border">
            <div className="flex items-center">
              <img
                src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover mr-3 border border-ig-border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate(`/profile/${post.author?.username}`)}
              />
              <span 
                className="font-semibold text-sm mr-2 cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${post.author?.username}`)}
              >
                {post.author?.username}
              </span>
            </div>

            <button
              onClick={() => setShowOptionsModal(true)}
              className="text-ig-text hover:text-ig-secondary-text p-1 cursor-pointer transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* List Komentar */}
          <div ref={commentListRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            {/* Caption sebagai komentar pertama */}
            <div className="flex items-start mb-6">
              <img
                src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0 border border-ig-border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate(`/profile/${post.author?.username}`)}
              />
              <div>
                <span 
                  className="font-semibold text-sm mr-2 cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${post.author?.username}`)}
                >
                  {post.author?.username}
                </span>
                <span className="text-sm whitespace-pre-wrap">{post.content}</span>
              </div>
            </div>

            {/* List komentar riil */}
            {commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.id || ""}
                onReplyClick={handleReplyClick}
              />
            ))}

            {isFetchingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 text-ig-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Input Bar (Fixed Bottom of Right Panel) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ig-border bg-ig-background">
            {replyTarget && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-neutral-400">
                  Membalas <span className="font-semibold text-ig-text">@{replyTarget.username}</span>
                </span>
                <button type="button" onClick={handleCancelReply} className="text-[12px] text-neutral-400 hover:text-ig-text">
                  Batal
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-[12px] font-semibold overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>

              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-50 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
                    <EmojiPicker
                      theme={currentTheme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                      onEmojiClick={(emojiData) => {
                        setInputValue((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                        inputRef.current?.focus();
                      }}
                      width={320}
                      height={400}
                      skinTonesDisabled
                      searchDisabled={false}
                    />
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                placeholder={replyTarget ? `Balas @${replyTarget.username}...` : "Tambahkan komentar..."}
                className="flex-1 bg-transparent text-[14px] text-ig-text outline-none placeholder:text-neutral-500 border-b border-neutral-700 focus:border-neutral-400 transition-colors py-1"
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`text-[14px] font-semibold transition-opacity flex-shrink-0 ${canSubmit ? "text-ig-primary hover:opacity-80 cursor-pointer" : "text-ig-primary opacity-30 cursor-not-allowed"}`}
              >
                {isSubmitting ? "..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL PILIHAN (THREE DOTS MENU) ── */}
      {showOptionsModal && post && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowOptionsModal(false)}>
          <div className="bg-ig-secondary-bg border border-ig-border rounded-xl w-full max-w-[400px] overflow-hidden flex flex-col text-center divide-y divide-ig-separator shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {post.author.id === currentUser?.id && (
              <button
                onClick={handleDeletePost}
                className="w-full text-red-500 font-bold hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
              >
                Hapus Postingan
              </button>
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
    </div>
  );
}
