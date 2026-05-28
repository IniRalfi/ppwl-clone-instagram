import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Comment } from "../../../../shared/src/types/comment";

interface CommentItemProps {
  comment: Comment;
  currentUserId: string | null;
  /** Dipanggil saat klik "Balas" — form reply muncul di bawah halaman */
  onReplyClick: (parentId: string, username: string) => void;
  /** Jika true, ini adalah reply (sudah di-indent) — tidak render replies lagi */
  isReply?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  onReplyClick,
  isReply = false,
}: CommentItemProps) {
  const navigate = useNavigate();
  /**
   * Instagram: replies di-collapse by default, expand dengan "Lihat X balasan".
   * Semua replies (termasuk replies-of-replies) ditampilkan FLAT di satu level
   * indent yang sama — tidak ada nested indent bertambah.
   */
  const [repliesOpen, setRepliesOpen] = useState(false);

  // Kumpulkan SEMUA replies secara flat (termasuk replies dalam replies)
  const flatReplies = isReply ? [] : collectFlatReplies(comment.replies ?? []);
  const replyCount = flatReplies.length;
  const canReply = !!currentUserId;
  const timeAgo = formatTimeAgo(comment.createdAt);
  const avatarColor = getAvatarColor(comment.author.username);

  return (
    <div>
      {/* ── Satu baris komentar ── */}
      <div className="flex gap-2.5 py-2.5">
        {/* Avatar */}
        <div 
          onClick={() => navigate(`/profile/${comment.author.username}`)}
          className="flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {comment.author.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold"
              style={{ backgroundColor: avatarColor }}
            >
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Konten */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-ig-text leading-snug">
            <span 
              onClick={() => navigate(`/profile/${comment.author.username}`)}
              className="font-semibold mr-1.5 cursor-pointer hover:underline"
            >
              {comment.author.username}
            </span>
            {/* Render @mention dengan warna biru, sisanya putih */}
            <ContentWithMentions text={comment.content} />
          </p>

          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-[12px] text-neutral-500">{timeAgo}</span>
            {canReply && (
              <button
                type="button"
                onClick={() => onReplyClick(comment.id, comment.author.username)}
                className="text-[12px] text-neutral-400 font-semibold hover:text-ig-text transition-colors"
              >
                Balas
              </button>
            )}
          </div>
        </div>

        {/* Ikon hati kanan */}
        <button
          type="button"
          className="flex-shrink-0 self-start mt-1 text-neutral-500 hover:text-red-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/*
       * ── Replies section ──-
       * Hanya dirender di level TOP (bukan isReply).
       * Semua replies ditampilkan FLAT dan sejajar — persis seperti Instagram.
       * Indent ml-9 hanya SATU kali di sini, tidak bertambah per level.
       */}
      {!isReply && replyCount > 0 && (
        <div className="ml-9">
          {/* Toggle "Lihat X balasan" / "Sembunyikan balasan" */}
          <button
            type="button"
            onClick={() => setRepliesOpen((prev) => !prev)}
            className="flex items-center gap-2 mb-1"
          >
            {/* Garis horizontal kecil — persis gaya IG */}
            <span className="block w-6 h-px bg-neutral-600" />
            <span className="text-[12px] text-neutral-400 font-semibold hover:text-ig-text transition-colors">
              {repliesOpen ? "Sembunyikan balasan" : `Lihat ${replyCount} balasan`}
            </span>
          </button>

          {repliesOpen && (
            <div>
              {flatReplies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReplyClick={
                    /*
                     * Ketika user balas dari dalam reply, kita tetap
                     * arahkan parentId ke komentar ROOT agar semua balasan
                     * tetap flat di bawah komentar utama — sama seperti IG.
                     */
                    (_parentId, username) => onReplyClick(comment.id, username)
                  }
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-komponen: render teks dengan @mention berwarna biru ──────

function ContentWithMentions({ text }: { text: string }) {
  // Pecah teks berdasarkan pola @username
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^@\w+$/.test(part) ? (
          <span key={i} className="text-[#4cb5f9] font-normal">
            {part}
          </span>
        ) : (
          <span key={i} className="text-neutral-200">
            {part}
          </span>
        )
      )}
    </>
  );
}

// ── Helper: kumpulkan semua replies secara FLAT (DFS) ────────────

function collectFlatReplies(replies: Comment[]): Comment[] {
  const result: Comment[] = [];
  for (const reply of replies) {
    result.push(reply);
    if (reply.replies && reply.replies.length > 0) {
      result.push(...collectFlatReplies(reply.replies));
    }
  }
  return result;
}

// ── Utilitas ────────────────────────────────────────────────────

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}j`;
  if (days < 7) return `${days}h`;
  return `${weeks}mg`;
}

function getAvatarColor(username: string): string {
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#10b981",
    "#06b6d4",
    "#f59e0b",
    "#ef4444",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  return colors[hash % colors.length];
}
