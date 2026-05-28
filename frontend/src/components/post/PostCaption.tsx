import React from "react";
import { Button } from "../ui/button";

interface PostCaptionProps {
  caption: string;
  username: string;
  isExpanded: boolean;
  shouldTruncate: boolean;
  displayedCaption: string;
  onToggleExpand: () => void;
  isEditing: boolean;
  editContent: string;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  isEditLoading: boolean;
  commentsCount: number;
  onCommentsClick: () => void;
  onUsernameClick: () => void;
  hoverCard: React.ReactNode;
  onHoverGroupEnter: () => void;
  onHoverGroupLeave: () => void;
}

export const PostCaption: React.FC<PostCaptionProps> = ({
  caption,
  username,
  isExpanded,
  shouldTruncate,
  displayedCaption,
  onToggleExpand,
  isEditing,
  editContent,
  onEditChange,
  onEditSave,
  onEditCancel,
  isEditLoading,
  commentsCount,
  onCommentsClick,
  onUsernameClick,
  hoverCard,
  onHoverGroupEnter,
  onHoverGroupLeave,
}) => {
  return (
    <div className="text-[13.5px] leading-relaxed relative">
      {isEditing ? (
        <div className="space-y-2 mt-2">
          <textarea
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full bg-ig-elevated-bg border border-ig-border text-ig-text rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ig-primary resize-none"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEditCancel}
              disabled={isEditLoading}
              className="text-xs text-ig-secondary-text hover:text-white"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={onEditSave}
              disabled={isEditLoading || !editContent.trim()}
              className="text-xs bg-ig-primary text-white hover:bg-blue-500"
            >
              {isEditLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <span
            className="inline-block relative group mr-2"
            onMouseEnter={onHoverGroupEnter}
            onMouseLeave={onHoverGroupLeave}
          >
            <span
              onClick={onUsernameClick}
              className="font-semibold cursor-pointer text-ig-text hover:underline text-[13.5px]"
            >
              {username}
            </span>
            {hoverCard}
          </span>
          <span className="text-ig-text whitespace-pre-wrap">{displayedCaption}</span>
          {shouldTruncate && !isExpanded && (
            <button
              onClick={() => onToggleExpand()}
              className="text-ig-secondary-text font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block"
            >
              ... lainnya
            </button>
          )}
          {isExpanded && shouldTruncate && (
            <button
              onClick={() => onToggleExpand()}
              className="text-ig-secondary-text text-xs font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block"
            >
              (lebih sedikit)
            </button>
          )}
        </div>
      )}

      {commentsCount > 0 && (
        <div
          onClick={onCommentsClick}
          className="text-[13.5px] text-ig-secondary-text cursor-pointer hover:underline pt-0.5 select-none"
        >
          Lihat semua {commentsCount} komentar
        </div>
      )}
    </div>
  );
};
