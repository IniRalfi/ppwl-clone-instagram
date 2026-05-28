import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

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
  }, [goNext, goPrev, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d]/98 backdrop-blur-md flex items-center justify-center transition-all duration-300">
      
      {/* ── TOMBOL CLOSE GLOBAL (X) pojok kanan atas layar ── */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer z-50"
        aria-label="Tutup story"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Wrapper Relatif Utama */}
      <div className="relative flex items-center justify-center w-full max-w-4xl px-4">
        
        {/* ── PREVIEW SLIDE SEBELUMNYA (Desktop) ── */}
        {currentIndex > 0 && (
          <div 
            onClick={goPrev}
            className="absolute -left-56 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-35 hover:opacity-60 transition-all duration-300 cursor-pointer scale-90 hover:scale-95 z-10"
          >
            <img
              src={group.stories[currentIndex - 1].imageUrl}
              alt="Preview sebelumnya"
              className="w-[160px] h-[284px] object-contain bg-black rounded-2xl border border-white/20 shadow-2xl blur-[0.8px]"
            />
            <span className="text-xs text-white/70 font-semibold tracking-wide uppercase">Sebelumnya</span>
          </div>
        )}

        {/* ── TOMBOL NAVIGASI KIRI (Chevron) ── */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute -left-14 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg cursor-pointer z-20"
            aria-label="Story sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* ── CENTRAL CONTAINER: Story Aktif (9:16 Aspect Ratio) ── */}
        <div className="relative h-[85vh] max-h-[820px] aspect-[9/16] w-auto bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between z-10">
          
          {/* Progress Bar & Header Wrapper */}
          <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-3 pb-6">
            
            {/* PROGRESS BAR */}
            <div className="flex gap-1.5 px-4 mb-3">
              {group.stories.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-[2.5px] bg-white/20 rounded-full overflow-hidden"
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

            {/* HEADER: avatar + username + waktu */}
            <div className="flex items-center gap-3 px-4">
              <img
                src={group.avatarUrl}
                alt={group.username}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/60 shadow"
              />
              <div className="flex-1">
                <p className="text-white text-sm font-semibold leading-none drop-shadow">
                  {group.username}
                </p>
                <p className="text-white/60 text-[11px] mt-0.5 drop-shadow">
                  {formatRelativeTime(currentStory.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* GAMBAR UTAMA STORY (Object Contain agar tidak dipotong/stretch) */}
          <img
            src={currentStory.imageUrl}
            alt={`Story slide ${currentIndex + 1}`}
            className="w-full h-full object-contain bg-black select-none"
          />

          {/* Area tap layar untuk navigasi sentuh (Mobile) */}
          <div className="absolute inset-0 flex">
            <div
              onClick={goPrev}
              className="w-1/3 h-full cursor-w-resize"
              title="Story sebelumnya"
            />
            <div
              onClick={goNext}
              className="w-2/3 h-full cursor-e-resize"
              title="Story berikutnya"
            />
          </div>
        </div>

        {/* ── TOMBOL NAVIGASI KANAN (Chevron) ── */}
        <button
          onClick={goNext}
          className="absolute -right-14 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg cursor-pointer z-20"
          aria-label="Story berikutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* ── PREVIEW SLIDE BERIKUTNYA (Desktop) ── */}
        {currentIndex < totalSlides - 1 && (
          <div 
            onClick={goNext}
            className="absolute -right-56 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-35 hover:opacity-60 transition-all duration-300 cursor-pointer scale-90 hover:scale-95 z-10"
          >
            <img
              src={group.stories[currentIndex + 1].imageUrl}
              alt="Preview berikutnya"
              className="w-[160px] h-[284px] object-contain bg-black rounded-2xl border border-white/20 shadow-2xl blur-[0.8px]"
            />
            <span className="text-xs text-white/70 font-semibold tracking-wide uppercase">Berikutnya</span>
          </div>
        )}

      </div>
    </div>
  );
}