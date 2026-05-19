import { useEffect, useRef, useState } from "react";
import type { Comment } from "../../../shared/src/types/comment";
import { CommentItem } from "../components/comment/CommentItem";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth.store";

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[]>([]);
  const [post, setPost] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State reply: null = komentar baru, isi = sedang balas komentar tertentu
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    username: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mengambil user aktif dari auth store
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setPost(json.data);
          setComments(json.data.comments || []);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: id,
          content: inputValue.trim(),
          parentId: replyTarget?.parentId ?? null,
          authorId: currentUser.id,
        }),
      });

      if (res.ok) {
        // Optimistic UI update or refresh post
        const resPost = await fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`);
        const json = await resPost.json();
        if (resPost.ok && json.data) {
          setComments(json.data.comments || []);
        }
        
        setInputValue("");
        setReplyTarget(null);
        toast.success("Komentar berhasil ditambahkan.");
      } else {
        toast.error("Gagal mengirim komentar.");
      }
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape" && replyTarget) handleCancelReply();
  };

  const canSubmit = inputValue.trim().length > 0 && !isSubmitting;

  if (isLoading) {
    return <div className="min-h-screen bg-ig-background text-ig-text flex justify-center items-center">Memuat postingan...</div>;
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
          <div className="flex items-center p-4 border-b border-ig-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mr-3">
              <img
                src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                alt="Avatar"
                className="w-full h-full rounded-full border-2 border-ig-background"
              />
            </div>
            <span className="font-semibold text-sm mr-2">{post.author?.username}</span>
          </div>

          {/* List Komentar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            {/* Caption sebagai komentar pertama */}
            <div className="flex items-start mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] mr-3 flex-shrink-0">
                <img
                  src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                  alt="Avatar"
                  className="w-full h-full rounded-full border-2 border-ig-background"
                />
              </div>
              <div>
                <span className="font-semibold text-sm mr-2">{post.author?.username}</span>
                <span className="text-sm whitespace-pre-wrap">{post.content}</span>
              </div>
            </div>

            {/* List komentar riil */}
            {comments.filter((c) => c.parentId === null).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.id || ""}
                onReplyClick={handleReplyClick}
              />
            ))}
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
    </div>
  );
}