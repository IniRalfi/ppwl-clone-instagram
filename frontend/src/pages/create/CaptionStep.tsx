import { X } from "lucide-react";
import { Avatar } from "../../components/common/Avatar";

interface CaptionStepProps {
  caption: string;
  onCaptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  imagePreview: string | null;
  onRemoveImage: () => void;
  avatarUrl: string | undefined;
  username: string | undefined;
  name: string;
}

export function CaptionStep({
  caption,
  onCaptionChange,
  imagePreview,
  onRemoveImage,
  avatarUrl,
  username,
  name,
}: CaptionStepProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      <div className="relative md:flex-1 w-full aspect-square md:aspect-auto bg-black flex items-center justify-center p-4">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg select-none"
          />
        )}
        <button
          type="button"
          onClick={onRemoveImage}
          className="absolute top-6 right-6 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full md:w-[340px] flex flex-col border-t md:border-t-0 md:border-l border-ig-border bg-ig-background p-4">
        <div className="flex items-center gap-3 pb-4">
          <Avatar
            name={name}
            avatarUrl={avatarUrl}
            size="sm"
          />
          <span className="text-sm font-semibold">{username}</span>
        </div>

        <div className="flex-1">
          <textarea
            value={caption}
            onChange={onCaptionChange}
            placeholder="Write a caption..."
            rows={8}
            maxLength={2200}
            className="w-full bg-transparent text-sm text-ig-text placeholder-neutral-500 resize-none focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-neutral-500">
            {caption.length}/2,200
          </span>
        </div>

        <hr className="border-ig-border my-4" />

        <div className="divide-y divide-ig-border text-sm text-ig-secondary-text">
          <div className="flex items-center justify-between py-2.5 opacity-40 cursor-not-allowed">
            <span>Add location</span>
            <span>📍</span>
          </div>
          <div className="flex items-center justify-between py-2.5 opacity-40 cursor-not-allowed">
            <span>Accessibility</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
