import { Button } from "../ui/button";

interface PostActionsProps {
  isLiked: boolean;
  onLikeToggle: () => void;
  isLikeLoading: boolean;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  isBookmarkLoading: boolean;
  onShareClick: () => void;
  currentLikeCount: number;
  commentsCount: number;
  onCommentClick: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  onLikeToggle,
  isLikeLoading,
  isBookmarked,
  onBookmarkToggle,
  isBookmarkLoading,
  onShareClick,
  currentLikeCount,
  commentsCount,
  onCommentClick,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-ig-text">
            <Button
              variant="ghost"
              size="icon"
              onClick={onLikeToggle}
              disabled={isLikeLoading}
              className={`h-12 w-12 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 cursor-pointer ${
                isLiked
                  ? "text-[#ed4956] hover:text-[#FF3040]"
                  : "text-ig-text hover:text-ig-secondary-text"
              }`}
            >
              {isLiked ? (
                <svg aria-label="Unlike" fill="#ed4956" stroke="#ed4956" strokeWidth="1" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              ) : (
                <svg aria-label="Like" fill="none" stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              )}
            </Button>
            <span className="text-sm font-semibold select-none text-ig-text">
              {currentLikeCount}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-ig-text">
            <Button
              onClick={onCommentClick}
              variant="ghost"
              size="icon"
              className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-12 w-12 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer"
            >
              <svg aria-label="Comment" fill="none" stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </Button>
            <span className="text-sm font-semibold select-none text-ig-text">
              {commentsCount}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onShareClick}
            className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-12 w-12 p-0 flex items-center justify-center transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer"
          >
            <svg aria-label="Share Post" fill="none" stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onBookmarkToggle}
          disabled={isBookmarkLoading}
          className={`h-12 w-12 p-0 flex items-center justify-center hover:bg-transparent transition-transform active:scale-75 hover:scale-110 duration-150 cursor-pointer ${
            isBookmarked ? "text-ig-text" : "text-ig-text hover:text-ig-secondary-text"
          }`}
        >
          <svg aria-label="Save" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-[44px] h-[44px]" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </Button>
      </div>

      <div className="text-sm font-bold text-ig-text select-none">
        {currentLikeCount > 0
          ? `${currentLikeCount.toLocaleString("id-ID")} suka`
          : "Jadilah yang pertama menyukai ini"}
      </div>
    </div>
  );
};
