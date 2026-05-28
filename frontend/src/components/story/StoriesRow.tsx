// frontend/src/components/story/StoriesRow.tsx

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth.store";
import StoryViewer from "./StoryViewer";
import { getActiveStories, uploadStory } from "../../services/story.service";
import { toast } from "sonner";

export interface ActiveStory {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface UserStoryGroup {
  userId: string;
  username: string;
  avatarUrl: string;
  hasUnread: boolean;
  stories: ActiveStory[];
}

interface StoryAvatarProps {
  group: UserStoryGroup;
  onClick: () => void;
}

function StoryAvatar({ group, onClick }: StoryAvatarProps) {
  const ringClass = group.hasUnread
    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]"
    : "bg-neutral-600 p-[2px]";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0 w-16"
    >
      <div className={`rounded-full ${ringClass}`}>
        <div className="rounded-full p-[2px] bg-ig-background">
          <img
            src={group.avatarUrl}
            alt={group.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
      </div>
      <span className="text-ig-text text-xs truncate w-full text-center">
        {group.username}
      </span>
    </button>
  );
}

interface MyStoryAvatarProps {
  onUploadSuccess: () => void;
}

function MyStoryAvatar({ onUploadSuccess }: MyStoryAvatarProps) {
  const { user } = useAuthStore();
  const username = "Cerita Anda";
  const avatarUrl =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${user?.name || "User"}`;

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah cerita...");
    try {
      await uploadStory(file);
      toast.success("Cerita berhasil diunggah! 🎉", { id: toastId });
      onUploadSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunggah cerita", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label className="flex flex-col items-center gap-1 flex-shrink-0 w-16 cursor-pointer relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />
      <div className="relative">
        <div className="rounded-full bg-neutral-700 p-[2px]">
          <div className="rounded-full p-[2px] bg-ig-background">
            <img
              src={avatarUrl}
              alt="Your story"
              className={`w-12 h-12 rounded-full object-cover ${isUploading ? "opacity-50 animate-pulse" : ""}`}
            />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-ig-primary border-2 border-ig-background flex items-center justify-center">
          {isUploading ? (
            <span className="text-white text-[9px] font-bold animate-spin">◌</span>
          ) : (
            <span className="text-white text-xs font-bold leading-none">+</span>
          )}
        </div>
      </div>
      <span className="text-ig-secondary-text text-xs truncate w-full text-center">
        {username}
      </span>
    </label>
  );
}

export function StoriesRow() {
  const [stories, setStories] = useState<UserStoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<UserStoryGroup | null>(null);
  const { user } = useAuthStore();

  const fetchStoriesData = async () => {
    try {
      const data = await getActiveStories();
      setStories(data);
    } catch (error) {
      console.error("❌ Gagal memuat stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoriesData();
  }, []);

  // Filter out current user's story group from the rest of the list, since we always display a dedicated MyStoryAvatar
  const otherStories = stories.filter((g) => g.userId !== user?.id);
  const myStoryGroup = stories.find((g) => g.userId === user?.id);

  return (
    <>
      <div className="w-full bg-ig-secondary-bg/60 backdrop-blur-md rounded-2xl border border-ig-border px-5 py-4 mb-6 shadow-card transition-all duration-300">
        <div className="flex gap-4 overflow-x-auto scrollbar-none">
          <MyStoryAvatar onUploadSuccess={fetchStoriesData} />
          
          {/* Jika user punya story sendiri, tampilkan avatar story miliknya yang bisa dilihat */}
          {myStoryGroup && (
            <StoryAvatar
              group={{ ...myStoryGroup, username: "Cerita Anda" }}
              onClick={() => setActiveGroup(myStoryGroup)}
            />
          )}

          {isLoading ? (
            <div className="flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-ig-elevated-bg rounded-full" />
              <div className="w-12 h-12 bg-ig-elevated-bg rounded-full" />
            </div>
          ) : (
            otherStories.map((group) => (
              <StoryAvatar
                key={group.userId}
                group={group}
                onClick={() => setActiveGroup(group)}
              />
            ))
          )}
        </div>
      </div>

      {activeGroup && (
        <StoryViewer
          group={activeGroup}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </>
  );
}