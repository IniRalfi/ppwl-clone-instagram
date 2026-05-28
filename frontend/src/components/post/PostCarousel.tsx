import { Heart, ChevronLeft, ChevronRight, User } from "lucide-react";
import { toast } from "sonner";
import { PostTag } from "../../lib/mockData";

interface PostCarouselProps {
  imageUrls: string[];
  tags: PostTag[];
  currentImgIndex: number;
  showTags: boolean;
  onToggleTags: () => void;
  onScrollToImage: (index: number) => void;
  onScroll: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  isDragging: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onDoubleClick: () => void;
  showHeartPop: boolean;
}

export const PostCarousel: React.FC<PostCarouselProps> = ({
  imageUrls,
  tags,
  currentImgIndex,
  showTags,
  onToggleTags,
  onScrollToImage,
  onScroll,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onMouseMove,
  isDragging,
  scrollContainerRef,
  onDoubleClick,
  showHeartPop,
}) => {
  return (
    <div
      className="relative w-full overflow-hidden bg-black flex items-center justify-center aspect-[4/5] rounded-[4px] border border-ig-border"
      onDoubleClick={onDoubleClick}
      onClick={onToggleTags}
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        className={`w-full h-full flex overflow-x-auto scrollbar-none select-none ${
          isDragging ? "scroll-auto" : "snap-x snap-mandatory scroll-smooth"
        } ${imageUrls.length > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
        style={{ scrollbarWidth: "none" }}
      >
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center pointer-events-none relative"
          >
            <img
              src={url}
              alt={`Postingan ke-${index + 1}`}
              className="w-full h-full object-contain bg-black select-none"
              draggable="false"
            />
            {index === 0 &&
              showTags &&
              tags.map((tag, tIdx) => (
                <div
                  key={tIdx}
                  className="absolute bg-ig-background/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg pointer-events-auto border border-ig-border animate-in fade-in zoom-in-95 duration-150"
                  style={{ left: `${tag.x}%`, top: `${tag.y}%`, transform: "translate(-50%, 0)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Membuka profil @${tag.username}...`);
                  }}
                >
                  <span className="cursor-pointer hover:underline">{tag.username}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {tags.length > 0 && (
        <button
          className={`absolute bottom-3 left-3 p-2 rounded-full transition-all duration-200 z-20 border-none cursor-pointer flex items-center justify-center backdrop-blur-sm ${
            showTags
              ? "bg-blue-500 text-white scale-105"
              : "bg-black/60 text-white/90 hover:bg-black/80 hover:scale-105"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTags();
          }}
        >
          <User className="h-4 w-4 fill-current" />
        </button>
      )}

      {showHeartPop && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none animate-in fade-in zoom-in-50">
          <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
        </div>
      )}

      {imageUrls.length > 1 && (
        <>
          {currentImgIndex > 0 && (
            <button
              onClick={() => onScrollToImage(currentImgIndex - 1)}
              className="absolute left-3 p-1 rounded-full bg-zinc-900/40 text-white/70 hover:bg-zinc-900/70 hover:text-white border-none cursor-pointer flex items-center justify-center z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {currentImgIndex < imageUrls.length - 1 && (
            <button
              onClick={() => onScrollToImage(currentImgIndex + 1)}
              className="absolute right-3 p-1 rounded-full bg-zinc-900/40 text-white/70 hover:bg-zinc-900/70 hover:text-white border-none cursor-pointer flex items-center justify-center z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 pointer-events-none z-10">
            {imageUrls.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === currentImgIndex ? "bg-blue-500 w-2" : "bg-zinc-500/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
