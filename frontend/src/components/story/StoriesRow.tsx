// frontend/src/components/story/StoriesRow.tsx

import { useState } from "react";
import { dummyStories } from "../../lib/mockData";
import { useAuthStore } from "../../store/auth.store";
import StoryViewer from "./StoryViewer";

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

function MyStoryAvatar() {
  // ✅ Pakai data asli dari auth store Rafli
  const { user } = useAuthStore();
  const username = user?.username ?? "Kamu";
  const avatarUrl =
    user?.avatarUrl ??
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

  const handleAddStory = () => {
    alert("Fitur Tambah Cerita Baru akan hadir di Phase 3!");
  };

  return (
    <button
      onClick={handleAddStory}
      className="flex flex-col items-center gap-1 flex-shrink-0 w-16"
    >
      <div className="relative">
        <div className="rounded-full bg-neutral-700 p-[2px]">
          <div className="rounded-full p-[2px] bg-ig-background">
            <img
              src={avatarUrl}
              alt="Your story"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-ig-primary border-2 border-ig-background flex items-center justify-center">
          <span className="text-white text-xs font-bold leading-none">+</span>
        </div>
      </div>
      <span className="text-ig-text text-xs truncate w-full text-center">
        {username}
      </span>
    </button>
  );
}

export function StoriesRow() {
  const [activeGroup, setActiveGroup] = useState<UserStoryGroup | null>(null);

  return (
    <>
      <div className="w-full bg-ig-secondary-bg rounded-xl border border-neutral-800 px-4 py-3 mb-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-none">
          <MyStoryAvatar />
          {dummyStories.map((group) => (
            <StoryAvatar
              key={group.userId}
              group={group}
              onClick={() => setActiveGroup(group)}
            />
          ))}
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