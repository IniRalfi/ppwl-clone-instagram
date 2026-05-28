import { useEffect, useState, useCallback } from "react";
import type { UserStoryGroup } from "./StoriesRow";

function formatRelativeTime(isoString: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 1000
  );
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

interface StoryViewerProps {
  group: UserStoryGroup;
  onClose: () => void;
}

export default function StoryViewer({ group, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const totalSlides = group.stories.length;
  const currentStory = group.stories[currentIndex];
  const DURATION = 5000; // 5 detik per slide

  const goNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, totalSlides, onClose]);

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 100 / (DURATION / 50);
      });
    }, 50);

    const timeout = setTimeout(() => {
      goNext();
    }, DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentIndex, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Container story — lebar maksimal seperti mobile */}
      <div className="relative w-full max-w-sm h-full max-h-[calc(100vh-2rem)] flex flex-col">

        {/* ── PROGRESS BAR ── */}
        <div className="flex gap-1 px-3 pt-3 pb-2">
          {group.stories.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── HEADER: avatar + username + waktu ── */}
        <div className="flex items-center gap-3 px-3 pb-3">
          <img
            src={group.avatarUrl}
            alt={group.username}
            className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
          />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold leading-tight">
              {group.username}
            </p>
            <p className="text-white/60 text-xs">
              {formatRelativeTime(currentStory.createdAt)}
            </p>
          </div>

          {/* Tombol Close (X) */}
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none p-1"
            aria-label="Tutup story"
          >
            ✕
          </button>
        </div>

        {/* ── GAMBAR STORY ── */}
        <div className="flex-1 relative overflow-hidden rounded-xl mx-2">
          <img
            src={currentStory.imageUrl}
            alt={`Story ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Area tap kiri — mundur */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 w-1/3 h-full opacity-0"
            aria-label="Story sebelumnya"
          />

          {/* Area tap kanan — maju */}
          <button
            onClick={goNext}
            className="absolute right-0 top-0 w-1/3 h-full opacity-0"
            aria-label="Story berikutnya"
          />
        </div>

        {/* Padding bawah */}
        <div className="h-4" />
      </div>
    </div>
  );
}