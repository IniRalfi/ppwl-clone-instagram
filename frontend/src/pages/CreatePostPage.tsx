import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("❌ File harus gambar (.jpg/.png/.gif)");
      setPreviewUrl(null);
      return;
    }

    setFileError(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || fileError) return;

    setIsSubmitting(true);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: caption,
          imageUrl: previewUrl,
        }),
      });

      window.location.href = "/";;
    } catch {
      alert("Gagal upload");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ig-background text-ig-text">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800">
        <button onClick={() => navigate("/")}>Batal</button>
        <h1 className="font-semibold">Postingan Baru</h1>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !caption}
          className="text-ig-primary font-semibold"
        >
          {isSubmitting ? "..." : "Bagikan"}
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-4">

        {/* PREVIEW */}
        {previewUrl ? (
          <img
            src={previewUrl}
            className="w-full h-[300px] object-cover rounded-lg"
          />
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-48 border border-neutral-700 flex items-center justify-center rounded-lg cursor-pointer"
          >
            Pilih Foto
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {fileError && (
          <p className="text-ig-badge text-sm">{fileError}</p>
        )}

        {/* CAPTION */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tulis caption..."
          className="w-full bg-transparent border-b border-neutral-800 pb-2 outline-none"
        />

        {/* LOKASI (FAKE UI) */}
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Tambahkan lokasi"
          className="w-full bg-transparent border-b border-neutral-800 pb-2 outline-none"
        />

        {/* MENU TAMBAHAN (UI ONLY) */}
        <div className="space-y-2 text-sm text-neutral-400">
          <p>Tambah orang</p>
          <p>Tambahkan musik</p>
          <p>Pengaturan lanjutan</p>
        </div>

      </div>
    </div>
  );
}