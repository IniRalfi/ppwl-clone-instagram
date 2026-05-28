import { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProfileImageEditorModal from "./ProfileImageEditorModal";

interface EditProfileProps {
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
  initialWebsite?: string;
  initialGender?: string;
  initialShowThreads?: boolean;
  initialSuggestions?: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    bio: string;
    avatarUrl: string;
    image?: File;
    website?: string;
    gender?: string;
    showThreads?: boolean;
    suggestions?: boolean;
  }) => Promise<void>;
}

export function EditProfileModal({
  initialName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
  initialWebsite = "",
  initialGender = "Male",
  initialShowThreads = false,
  initialSuggestions = true,
  onClose,
  onSave,
}: EditProfileProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl);
  
  const [website, setWebsite] = useState(initialWebsite);
  const [showThreads, setShowThreads] = useState(initialShowThreads);
  const [gender, setGender] = useState(initialGender);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5 MB.");
        return;
      }
      setEditingFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

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
        image: avatarFile || undefined,
        website: website.trim(),
        gender,
        showThreads,
        suggestions,
      });
      onClose();
    } catch {
      // Error handled by parent handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarSrc =
    avatarPreview ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${initialUsername}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ig-border">
          <h2 className="text-ig-text font-bold text-lg">Edit profile</h2>
          <button
            onClick={onClose}
            className="text-ig-text hover:opacity-60 transition-opacity cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* Avatar & Change Photo Card */}
          <div className="bg-ig-background/60 border border-ig-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-ig-border flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={initialUsername}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-ig-text font-bold text-sm leading-tight mb-0.5">{initialUsername}</p>
                <p className="text-ig-secondary-text text-xs leading-none">{name || initialName}</p>
              </div>
            </div>
            
            <div>
              <button
                type="button"
                onClick={triggerFileSelect}
                className="bg-ig-primary text-white font-semibold text-xs px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Change photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Website Input */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-ig-text font-bold text-sm">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website"
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors"
            />
            <p className="text-ig-secondary-text text-[11px] leading-snug">
              Editing your links is only available on mobile. Visit the Instagram app and edit your profile to change the websites in your bio.
            </p>
          </div>

          {/* Bio Input */}
          <div className="flex flex-col gap-2 text-left relative">
            <div className="flex justify-between items-center">
              <label className="text-ig-text font-bold text-sm">Bio</label>
              <span className="text-ig-secondary-text text-[11px]">
                {bio.length} / 150
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.substring(0, 150))}
              placeholder="Tulis bio..."
              rows={3}
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors resize-none"
            />
          </div>

          {/* Show Threads badge */}
          <div className="flex items-center justify-between py-2 text-left">
            <div>
              <label className="text-ig-text font-bold text-sm block">Show Threads badge</label>
            </div>
            <button
              type="button"
              onClick={() => setShowThreads(!showThreads)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                showThreads ? "bg-ig-primary" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  showThreads ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Gender Input */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-ig-text font-bold text-sm">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <p className="text-ig-secondary-text text-[11px]">
              This won't be part of your public profile.
            </p>
          </div>

          {/* Show account suggestions on profiles */}
          <div className="flex items-start justify-between py-2 text-left gap-4">
            <div className="flex-1 min-w-0">
              <label className="text-ig-text font-bold text-sm block mb-1">
                Show account suggestions on profiles
              </label>
              <p className="text-ig-secondary-text text-[11px] leading-snug">
                Choose whether people can see similar account suggestions on your profile, and whether your account can be suggested on other profiles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuggestions(!suggestions)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 mt-1 ${
                suggestions ? "bg-ig-primary" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  suggestions ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

        </div>

        {/* Footer Submit Button */}
        <div className="p-5 border-t border-ig-border bg-ig-secondary-bg">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-ig-primary hover:opacity-90 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Submit
          </button>
        </div>

      {editingFile && (
        <ProfileImageEditorModal
          imageFile={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={(editedFile) => {
            setAvatarFile(editedFile);
            setAvatarPreview(URL.createObjectURL(editedFile));
            setEditingFile(null);
            toast.success("Foto profil berhasil disunting! Klik Submit untuk menyimpan.");
          }}
        />
      )}
      </div>
    </div>
  );
}
