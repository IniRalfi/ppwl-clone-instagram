import { type RefObject } from "react";
import { ImageIcon, VideoIcon } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UploadStepProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isLoading: boolean;
}

export function UploadStep({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  fileInputRef,
}: UploadStepProps) {
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center gap-5 transition-colors duration-200 ${
        isDragOver ? "bg-blue-500/5" : "bg-ig-background"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="relative">
        <ImageIcon className="h-20 w-20 text-ig-text opacity-90" strokeWidth={1} />
        <VideoIcon
          className="h-10 w-10 text-ig-text opacity-90 absolute -bottom-1 -right-3"
          strokeWidth={1}
        />
      </div>

      <p className="text-ig-text text-xl font-light">
        {isDragOver ? "Lepaskan di sini!" : "Seret foto dan video ke sini"}
      </p>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-1.5 bg-ig-primary hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
      >
        Pilih dari komputer
      </button>

      <p className="text-neutral-600 text-xs">
        JPEG, PNG, WebP, GIF — maks. {MAX_FILE_SIZE_MB} MB
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
