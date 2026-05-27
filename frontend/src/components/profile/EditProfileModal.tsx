import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditProfileProps {
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
  onClose: () => void;
  onSave: (data: { name: string; bio: string; avatarUrl: string }) => Promise<void>;
}

export function EditProfileModal({
  initialName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
  onClose,
  onSave,
}: EditProfileProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      onClose();
    } catch {
      // Error handled by parent handler
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <span className="text-ig-text font-semibold text-sm">Edit Profil</span>
          <button
            onClick={onClose}
            className="text-ig-text hover:opacity-60 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Username (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              Username (Tidak dapat diubah)
            </label>
            <input
              type="text"
              value={initialUsername}
              disabled
              className="bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-2 text-ig-secondary-text text-sm outline-none cursor-not-allowed"
            />
          </div>

          {/* Nama Lengkap */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tulis bio kamu..."
              rows={3}
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors resize-none"
            />
          </div>

          {/* Avatar URL */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              URL Foto Profil
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 text-ig-text text-sm font-semibold bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 text-white text-sm font-semibold bg-ig-primary hover:opacity-85 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
