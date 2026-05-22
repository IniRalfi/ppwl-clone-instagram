import { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  initialCount: number;
  initialIsLiked?: boolean;
  onToggle?: (isLiked: boolean) => void;
}

export function LikeButton({
  initialCount,
  initialIsLiked = false,
  onToggle,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    onToggle?.(newIsLiked);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        className="transition-transform active:scale-90"
      >
        <Heart
          className={`w-6 h-6 ${
            isLiked
              ? "fill-ig-badge text-ig-badge"
              : "text-ig-text"
          }`}
        />
      </button>
      <span className="text-ig-text text-sm font-semibold">{count}</span>
    </div>
  );
}