import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { createPost } from "../services/post.service";
import { toast } from "sonner";
import { ImageIcon, VideoIcon, X, ArrowLeft, Loader2 } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { compressImage } from "../lib/image";

/** Ukuran maksimal file yang diizinkan (sesuai backend: 5 MB) */
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Step = "upload" | "caption";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>("upload");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Clean up Object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validasi dan proses file yang dipilih ──
  const processFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Ukuran gambar maksimal ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    try {
      const optimizedFile = await compressImage(file);
      setImageFile(optimizedFile);
      setImagePreview(URL.createObjectURL(optimizedFile));
    } catch (err) {
      console.warn("⚠️ Gagal mengompres gambar, menggunakan file asli:", err);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    // Langsung pindah ke step caption setelah pilih gambar
    setStep("caption");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit form ──
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Kamu harus login terlebih dahulu.");
      return;
    }
    if (!caption.trim() && !imageFile) {
      toast.error("Tambahkan caption atau gambar terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      await createPost({
        userId: user.id,
        content: caption.trim(),
        image: imageFile ?? undefined,
      });
      toast.success("Postingan berhasil dibagikan! 🎉");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat postingan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex flex-col">

      {/* ── Header — Mirip Instagram "Create new post" ── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-11 border-b border-ig-border bg-ig-background">
        <button
          onClick={step === "caption" ? handleRemoveImage : () => navigate(-1)}
          className="p-1 rounded-full hover:bg-ig-secondary-bg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold">
          {step === "upload" ? "Buat postingan baru" : "Edit"}
        </h1>
        {step === "caption" ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!caption.trim() && !imageFile)}
            className="text-sm font-semibold text-ig-primary hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bagikan"}
          </button>
        ) : (
          <div className="w-14" /> // spacer agar judul tetap tengah
        )}
      </div>

      {/* ── Main Content ── */}
      {step === "upload" ? (
        /* ── Step 1: Upload area ── */
        <div
          className={`flex-1 flex flex-col items-center justify-center gap-5 transition-colors duration-200 ${
            isDragOver ? "bg-blue-500/5" : "bg-ig-background"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Ikon file seperti IG asli */}
          <div className="relative">
            <ImageIcon className="h-20 w-20 text-ig-text opacity-90" strokeWidth={1} />
            <VideoIcon
              className="h-10 w-10 text-ig-text opacity-90 absolute -bottom-1 -right-3"
              strokeWidth={1}
            />
          </div>

          <p className="text-ig-text text-xl font-light">
            {isDragOver ? "Lepaskan di sini!" : "Drag photos and videos here"}
          </p>

          {/* Tombol "Select from computer" — persis seperti IG */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 bg-ig-primary hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Select from computer
          </button>

          <p className="text-neutral-600 text-xs">
            JPEG, PNG, WebP, GIF — maks. {MAX_FILE_SIZE_MB} MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* ── Step 2: Preview + Caption (2-panel layout) ── */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* Panel Kiri: Preview Gambar */}
          <div className="relative md:flex-1 w-full aspect-square md:aspect-auto bg-black flex items-center justify-center">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain md:object-cover"
              />
            )}
            {/* Tombol hapus gambar */}
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel Kanan: Username + Caption + Info */}
          <div className="w-full md:w-[340px] flex flex-col border-t md:border-t-0 md:border-l border-ig-border bg-ig-background">
            {/* Info User */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar
                name={user?.name ?? "?"}
                avatarUrl={user?.avatarUrl}
                size="sm"
              />
              <span className="text-sm font-semibold">{user?.username}</span>
            </div>

            {/* Textarea Caption */}
            <div className="px-4 flex-1">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={8}
                maxLength={2200}
                className="w-full bg-transparent text-sm text-ig-text placeholder-neutral-500 resize-none focus:outline-none leading-relaxed"
              />
            </div>

            {/* Counter karakter */}
            <div className="px-4 pb-3 flex justify-end">
              <span className="text-xs text-neutral-500">
                {caption.length}/2,200
              </span>
            </div>

            <hr className="border-ig-border" />

            {/* Info tambahan (Add location, dll) */}
            <div className="divide-y divide-ig-border text-sm text-ig-secondary-text">
              <div className="flex items-center justify-between px-4 py-3 opacity-40 cursor-not-allowed">
                <span>Add location</span>
                <span className="text-lg">📍</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 opacity-40 cursor-not-allowed">
                <span>Accessibility</span>
                <span className="text-xs text-neutral-500">›</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}