import React from "react";

interface PostOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnPost: boolean;
  isAuthorFollowed: boolean;
  isBookmarked: boolean;
  onUnfollow: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onToggleBookmark: () => void;
  onEditCaption: () => void;
  onShareClick: () => void;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  isOpen,
  onClose,
  isOwnPost,
  isAuthorFollowed,
  isBookmarked,
  onUnfollow,
  onDelete,
  onCopyLink,
  onToggleBookmark,
  onEditCaption,
  onShareClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-ig-secondary-bg border border-ig-border rounded-xl w-full max-w-[400px] overflow-hidden flex flex-col text-center divide-y divide-ig-separator shadow-2xl">
        {isOwnPost ? (
          <>
            <button
              onClick={onDelete}
              className="w-full text-red-500 font-bold hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              Hapus Postingan
            </button>
            <button
              onClick={() => {
                onEditCaption();
                onClose();
              }}
              className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              Edit Caption
            </button>
          </>
        ) : (
          isAuthorFollowed && (
            <button
              onClick={onUnfollow}
              className="w-full text-red-500 font-bold hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
            >
              Batal Mengikuti
            </button>
          )
        )}
        <button
          onClick={() => {
            onToggleBookmark();
            onClose();
          }}
          className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
        >
          {isBookmarked ? "Batalkan Simpan" : "Simpan Postingan"}
        </button>
        <button
          onClick={() => {
            onShareClick();
            onClose();
          }}
          className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
        >
          Bagikan...
        </button>
        <button
          onClick={onCopyLink}
          className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
        >
          Salin Tautan
        </button>
        <button
          onClick={onClose}
          className="w-full text-ig-text hover:bg-ig-elevated-bg/50 py-3.5 text-sm cursor-pointer border-none bg-transparent transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  );
};
