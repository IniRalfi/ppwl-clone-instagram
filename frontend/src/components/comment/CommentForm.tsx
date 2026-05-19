import { useRef, useState } from "react";

// Batas maksimal komentar per user per post (syarat dosen)
const MAX_COMMENTS_PER_USER = 5;

interface CommentFormProps {
  /** Jumlah komentar user saat ini di post ini (termasuk replies) */
  userCommentCount: number;
  /** Dipanggil ketika user submit komentar. Kembalikan Promise agar form bisa reset setelah berhasil. */
  onSubmit: (content: string) => Promise<void>;
  /** Teks placeholder di textarea */
  placeholder?: string;
  /** Kalau ini form reply, tampilkan tombol "Batal" */
  onCancel?: () => void;
  /** Mode auto-focus (untuk form reply yang muncul setelah klik tombol Reply) */
  autoFocus?: boolean;
}

export function CommentForm({
  userCommentCount,
  onSubmit,
  placeholder = "Tambahkan komentar...",
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cek apakah user sudah mencapai batas komentar
  const isLimitReached = userCommentCount >= MAX_COMMENTS_PER_USER;

  // Tombol kirim aktif hanya kalau: ada isi, belum melebihi limit, dan tidak sedang proses kirim
  const canSubmit = content.trim().length > 0 && !isLimitReached && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent(""); // Reset setelah berhasil
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kirim dengan Ctrl+Enter atau Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Peringatan batas komentar — muncul kalau sudah mencapai limit */}
      {isLimitReached && (
        <p className="text-[13px] text-red-400 font-medium">
          ⚠️ Batas komentar tercapai. Kamu sudah membuat {MAX_COMMENTS_PER_USER} komentar di postingan ini.
        </p>
      )}

      <div className="flex items-start gap-3">
        {/* Area input teks */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLimitReached ? "Tidak dapat menambah komentar lagi." : placeholder}
          disabled={isLimitReached || isSubmitting}
          autoFocus={autoFocus}
          rows={1}
          className={[
            // Base styling — menyesuaikan desain Instagram gelap
            "flex-1 resize-none bg-transparent text-[14px] text-ig-text",
            "placeholder:text-neutral-500 outline-none",
            "border-b border-neutral-700 focus:border-neutral-400",
            "py-1 transition-colors duration-150",
            // Kalau limit tercapai, tampilkan visual disabled
            isLimitReached ? "opacity-40 cursor-not-allowed" : "",
          ]
            .join(" ")
            .trim()}
        />

        {/* Grup tombol: Batal (opsional) + Kirim */}
        <div className="flex items-center gap-2 pt-0.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-[13px] text-neutral-400 hover:text-ig-text transition-colors"
            >
              Batal
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              "text-[14px] font-semibold transition-opacity",
              canSubmit
                ? "text-ig-primary hover:opacity-80 cursor-pointer"
                : "text-ig-primary opacity-30 cursor-not-allowed",
            ].join(" ")}
          >
            {isSubmitting ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </div>

      {/* Counter sisa komentar — tampil kalau mendekati limit */}
      {!isLimitReached && userCommentCount >= MAX_COMMENTS_PER_USER - 2 && (
        <p className="text-[12px] text-neutral-500">
          Sisa {MAX_COMMENTS_PER_USER - userCommentCount} komentar lagi yang bisa kamu buat.
        </p>
      )}
    </div>
  );
}
