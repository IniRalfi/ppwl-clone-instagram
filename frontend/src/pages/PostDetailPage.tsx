import { useEffect, useRef, useState } from "react";
import type { Comment } from "../../../shared/src/types/comment";
import { CommentItem } from "../components/comment/CommentItem";
import { countUserComments } from "../services/comment.service";

// ── Dummy user yang sedang "login" ───────────────────────────────
const DUMMY_CURRENT_USER = {
  id: "u1",
  name: "Andi",
  username: "andi_dev",
  avatarUrl: null,
};

// ── Dummy komentar bersarang ─────────────────────────────────────
const DUMMY_COMMENTS: Comment[] = [
  {
    id: "1",
    content: "Mantap postingannya! 🔥",
    authorId: "u1",
    postId: "p1",
    parentId: null,
    createdAt: new Date().toISOString(),
    author: { id: "u1", username: "andi_dev", name: "Andi", avatarUrl: null },
    replies: [
      {
        id: "2",
        content: "Setuju banget sama kamu!",
        authorId: "u2",
        postId: "p1",
        parentId: "1",
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        author: { id: "u2", username: "budi_123", name: "Budi", avatarUrl: null },
        replies: [
          {
            id: "4",
            content: "Nah ini yang aku tunggu-tunggu 😄",
            authorId: "u3",
            postId: "p1",
            parentId: "2",
            createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
            author: { id: "u3", username: "citra_ui", name: "Citra", avatarUrl: null },
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    content: "Keren banget proyeknya, sukses terus! 💪",
    authorId: "u3",
    postId: "p1",
    parentId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    author: { id: "u3", username: "citra_ui", name: "Citra", avatarUrl: null },
    replies: [],
  },
  {
    id: "5",
    content: "Wah ini clone IG ya? Mantap 👏",
    authorId: "u4",
    postId: "p1",
    parentId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    author: { id: "u4", username: "deni_code", name: "Deni", avatarUrl: null },
    replies: [],
  },
];

const MAX_COMMENTS = 5;

export function PostDetailPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State reply: null = komentar baru, isi = sedang balas komentar tertentu
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    username: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const user = DUMMY_CURRENT_USER;

  useEffect(() => {
    const timer = setTimeout(() => {
      setComments(DUMMY_COMMENTS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const userCommentCount = countUserComments(comments, user.id);
  const isLimitReached = userCommentCount >= MAX_COMMENTS;
  const canSubmit = inputValue.trim().length > 0 && !isLimitReached && !isSubmitting;

  // Dipanggil saat klik "Balas" di CommentItem
  const handleReplyClick = (parentId: string, username: string) => {
    setReplyTarget({ parentId, username });
    setInputValue(`@${username} `);
    // Fokus ke input bar di bawah
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Batal reply — reset ke mode komentar biasa
  const handleCancelReply = () => {
    setReplyTarget(null);
    setInputValue("");
    inputRef.current?.focus();
  };

  // Submit — bisa komentar baru atau reply
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 300));

    const newComment: Comment = {
      id: `local-${Date.now()}`,
      content: inputValue.trim(),
      authorId: user.id,
      postId: "p1",
      parentId: replyTarget?.parentId ?? null,
      createdAt: new Date().toISOString(),
      author: user,
      replies: [],
    };

    if (replyTarget) {
      setComments((prev) => insertReply(prev, replyTarget.parentId, newComment));
    } else {
      setComments((prev) => [...prev, newComment]);
    }

    setInputValue("");
    setReplyTarget(null);
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape" && replyTarget) handleCancelReply();
  };

  return (
    <div className="min-h-screen bg-ig-background flex flex-col">

      {/* ── Konten scrollable ── */}
      <div className="flex-1 overflow-y-auto max-w-xl w-full mx-auto px-4 pt-6 pb-24">
        <h2 className="text-[16px] font-semibold text-ig-text mb-4 border-b border-neutral-800 pb-3">
          Komentar
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="text-neutral-500 text-[14px] animate-pulse">Memuat komentar...</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-neutral-500 text-[14px] text-center py-12">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {comments
              .filter((c) => c.parentId === null)
              .map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user.id}
                  onReplyClick={handleReplyClick}
                />
              ))}
          </div>
        )}
      </div>

      {/* ── Input bar bawah — fixed, persis kayak IG ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-ig-background border-t border-neutral-800">
        <div className="max-w-xl mx-auto px-4 py-3">

          {/* Label "Membalas @username" + tombol Batal */}
          {replyTarget && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-neutral-400">
                Membalas{" "}
                <span className="font-semibold text-ig-text">
                  @{replyTarget.username}
                </span>
              </span>
              <button
                type="button"
                onClick={handleCancelReply}
                className="text-[12px] text-neutral-400 hover:text-ig-text transition-colors"
              >
                Batal
              </button>
            </div>
          )}

          {/* Peringatan limit */}
          {isLimitReached && (
            <p className="text-[12px] text-red-400 mb-2">
              ⚠️ Batas komentar tercapai ({MAX_COMMENTS} komentar).
            </p>
          )}

          <div className="flex items-center gap-3">
            {/* Avatar user */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-[12px] font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Ikon emoji */}
            <button
              type="button"
              className="flex-shrink-0 text-neutral-400 hover:text-ig-text transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>

            {/* Input teks */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLimitReached || isSubmitting}
              placeholder={
                isLimitReached
                  ? "Tidak dapat menambah komentar lagi."
                  : replyTarget
                  ? `Balas @${replyTarget.username}...`
                  : "Tambahkan komentar..."
              }
              className={[
                "flex-1 bg-transparent text-[14px] text-ig-text outline-none",
                "placeholder:text-neutral-500 border-b border-neutral-700",
                "focus:border-neutral-400 transition-colors py-1",
                isLimitReached ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            />

            {/* Tombol Kirim */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={[
                "text-[14px] font-semibold transition-opacity flex-shrink-0",
                canSubmit
                  ? "text-ig-primary hover:opacity-80 cursor-pointer"
                  : "text-ig-primary opacity-30 cursor-not-allowed",
              ].join(" ")}
            >
              {isSubmitting ? "..." : "Kirim"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Helper: sisipkan reply ke dalam tree ────────────────────────
function insertReply(
  comments: Comment[],
  parentId: string,
  newReply: Comment,
): Comment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies ?? []), newReply] };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: insertReply(c.replies, parentId, newReply) };
    }
    return c;
  });
}