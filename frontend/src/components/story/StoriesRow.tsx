// frontend/src/components/story/StoriesRow.tsx

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import StoryViewer from "./StoryViewer";
import { getActiveStories } from "../../services/story.service";
import { toast } from "sonner";
import StoryEditorModal from "./StoryEditorModal";

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
    ? "bg-gradient-to-tr from-[#FFD600] via-[#FF0069] to-[#7638FA] p-[2px]"
    : "bg-ig-border p-[1px]";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 w-24 cursor-pointer select-none"
    >
      <div className={`rounded-full ${ringClass} transition-transform duration-200 hover:scale-[1.03]`}>
        <div className="rounded-full p-[2.5px] bg-ig-background">
          <img
            src={group.avatarUrl}
            alt={group.username}
            className="w-[64px] h-[64px] rounded-full object-cover"
          />
        </div>
      </div>
      <span className="text-ig-text text-[11px] font-normal tracking-tight truncate w-full text-center">
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    e.target.value = ""; // reset
  };

  return (
    <>
      <label className="flex flex-col items-center gap-1.5 flex-shrink-0 w-20 cursor-pointer relative select-none">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="relative transition-transform duration-200 hover:scale-[1.03]">
          <div className="rounded-full bg-ig-border p-[1px]">
            <div className="rounded-full p-[2.5px] bg-ig-background">
              <img
                src={avatarUrl}
                alt="Your story"
                className="w-[64px] h-[64px] rounded-full object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-ig-primary border-2 border-ig-background flex items-center justify-center shadow">
            <span className="text-white text-xs font-bold leading-none">+</span>
          </div>
        </div>
        <span className="text-ig-secondary-text text-[11px] tracking-tight truncate w-full text-center">
          {username}
        </span>
      </label>

      {selectedFile && (
        <StoryEditorModal
          imageFile={selectedFile}
          onClose={() => setSelectedFile(null)}
          onUploadSuccess={onUploadSuccess}
        />
      )}
    </>
  );
}

export function StoriesRow() {
  const [stories, setStories] = useState<UserStoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<UserStoryGroup | null>(null);
  const { user } = useAuthStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(false);

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

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 2);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [stories, isLoading]);

  const handleScrollAction = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Berikan jeda untuk transisi scroll selesai baru hitung status tombol
      setTimeout(checkScroll, 350);
    }
  };

  const otherStories = stories.filter((g) => g.userId !== user?.id);
  const myStoryGroup = stories.find((g) => g.userId === user?.id);

  // Gabungkan seluruh grup cerita aktif untuk dinavigasikan di StoryViewer
  const allActiveGroups: UserStoryGroup[] = [];
  if (myStoryGroup) {
    allActiveGroups.push({ ...myStoryGroup, username: "Cerita Anda" });
  }
  allActiveGroups.push(...otherStories);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  return (
    <>
      <div className="w-full bg-transparent px-0 py-2 mb-6 relative group/stories">
        {/* Tombol Scroll Kiri */}
        {showLeftBtn && (
          <button
            onClick={() => handleScrollAction("left")}
            className="absolute left-1 top-1/2 -translate-y-[38px] w-6 h-6 rounded-full bg-white text-neutral-800 flex items-center justify-center shadow-md hover:bg-neutral-100 cursor-pointer z-10 transition-all active:scale-90"
            aria-label="Stories sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </button>
        )}

        {/* List Stories */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-1 snap-x select-none"
        >
          <MyStoryAvatar onUploadSuccess={fetchStoriesData} />
          
          {/* Jika user punya story sendiri, tampilkan avatar story miliknya yang bisa dilihat */}
          {myStoryGroup && (
            <StoryAvatar
              group={{ ...myStoryGroup, username: "Cerita Anda" }}
              onClick={() => setActiveGroupId(myStoryGroup.userId)}
            />
          )}

          {isLoading ? (
            <div className="flex gap-4 animate-pulse">
              <div className="w-24 flex flex-col items-center gap-1.5">
                <div className="w-[76px] h-[76px] bg-ig-border rounded-full" />
                <div className="w-12 h-3 bg-ig-border rounded" />
              </div>
              <div className="w-24 flex flex-col items-center gap-1.5">
                <div className="w-[76px] h-[76px] bg-ig-border rounded-full" />
                <div className="w-12 h-3 bg-ig-border rounded" />
              </div>
            </div>
          ) : (
            otherStories.map((group) => (
              <StoryAvatar
                key={group.userId}
                group={group}
                onClick={() => setActiveGroupId(group.userId)}
              />
            ))
          )}
        </div>

        {/* Tombol Scroll Kanan */}
        {showRightBtn && (
          <button
            onClick={() => handleScrollAction("right")}
            className="absolute right-1 top-1/2 -translate-y-[38px] w-6 h-6 rounded-full bg-white text-neutral-800 flex items-center justify-center shadow-md hover:bg-neutral-100 cursor-pointer z-10 transition-all active:scale-90"
            aria-label="Stories berikutnya"
          >
            <ChevronRight className="w-4 h-4 stroke-[3px]" />
          </button>
        )}
      </div>

      {activeGroupId && (
        <StoryViewer
          groups={allActiveGroups}
          initialGroupId={activeGroupId}
          onClose={() => setActiveGroupId(null)}
        />
      )}
    </>
  );
}