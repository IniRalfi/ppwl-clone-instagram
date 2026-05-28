import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar } from "../common/Avatar";

interface PostHeaderProps {
  username: string;
  avatarUrl: string;
  timeAgo: string;
  onUsernameClick: () => void;
  onToggleOptions: () => void;
  hoverCard: React.ReactNode;
  onHoverGroupEnter: () => void;
  onHoverGroupLeave: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  username,
  avatarUrl,
  timeAgo,
  onUsernameClick,
  onToggleOptions,
  hoverCard,
  onHoverGroupEnter,
  onHoverGroupLeave,
}) => {
  return (
    <div className="flex items-center justify-between px-0 pb-3 relative">
      <div className="flex items-center space-x-3">
        <div onClick={onUsernameClick} className="cursor-pointer">
          <Avatar
            avatarUrl={avatarUrl}
            name={username}
            size="sm"
            className="border border-ig-border"
          />
        </div>
        <div
          className="flex items-baseline space-x-2 relative group"
          onMouseEnter={onHoverGroupEnter}
          onMouseLeave={onHoverGroupLeave}
        >
          <span
            onClick={onUsernameClick}
            className="font-semibold text-[14px] text-ig-text hover:text-ig-secondary-text cursor-pointer"
          >
            {username}
          </span>
          <span className="text-xs text-ig-secondary-text">• {timeAgo}</span>
          {hoverCard}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleOptions}
        className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent rounded-full h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};
