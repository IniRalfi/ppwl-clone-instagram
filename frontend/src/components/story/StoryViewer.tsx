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
  groups: UserStoryGroup[];
  initialGroupId: string;
  onClose: () => void;
}

export default function StoryViewer({ groups, initialGroupId, onClose }: StoryViewerProps) {
  const initialGroupIdx = groups.findIndex((g) => g.userId === initialGroupId);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIdx !== -1 ? initialGroupIdx : 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const group = groups[currentGroupIndex];
  const totalSlides = group?.stories.length ?? 0;
  const currentStory = group?.stories[currentIndex];
  const DURATION = 5000; // 5 detik per slide

  const goNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Pindah ke akun berikutnya jika masih ada
      if (currentGroupIndex < groups.length - 1) {
        setCurrentGroupIndex((prev) => prev + 1);
        setCurrentIndex(0);
        setProgress(0);
      } else {
        onClose();
      }
    }
  }, [currentIndex, totalSlides, currentGroupIndex, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      // Pindah ke akun sebelumnya jika ada
      if (currentGroupIndex > 0) {
        const prevGroupIdx = currentGroupIndex - 1;
        const prevGroup = groups[prevGroupIdx];
        setCurrentGroupIndex(prevGroupIdx);
        setCurrentIndex(prevGroup.stories.length - 1);
        setProgress(0);
      }
    }
  }, [currentIndex, currentGroupIndex, groups]);

  // Reset status muat gambar setiap kali slide berpindah
  useEffect(() => {
    setIsImageLoaded(false);
    setProgress(0);
  }, [currentIndex, currentGroupIndex]);

  // Timer progres hanya berjalan jika gambar selesai dimuat (isImageLoaded === true)
  useEffect(() => {
    if (!isImageLoaded) return;

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
  }, [currentIndex, currentGroupIndex, goNext, isImageLoaded]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  if (!group || !currentStory) return null;

  // Resolusi preview sebelumnya (hanya jika berasal dari AKUN LAIN / BEDA AKUN)
  let prevStoryImg: string | null = null;
  let prevStoryLabel = "";
  if (currentIndex === 0 && currentGroupIndex > 0) {
    const prevGroup = groups[currentGroupIndex - 1];
    prevStoryImg = prevGroup.stories[prevGroup.stories.length - 1].imageUrl;
    prevStoryLabel = prevGroup.username;
  }

  // Resolusi preview berikutnya (hanya jika berasal dari AKUN LAIN / BEDA AKUN)
  let nextStoryImg: string | null = null;
  let nextStoryLabel = "";
  if (currentIndex === totalSlides - 1 && currentGroupIndex < groups.length - 1) {
    const nextGroup = groups[currentGroupIndex + 1];
    nextStoryImg = nextGroup.stories[0].imageUrl;
    nextStoryLabel = nextGroup.username;
  }

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
      <div className="relative flex items-center justify-center w-full max-w-5xl px-4">
        
        {/* ── PREVIEW SLIDE SEBELUMNYA (Desktop) ── */}
        {prevStoryImg && (
          <div 
            onClick={goPrev}
            className="absolute -left-64 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-35 hover:opacity-60 transition-all duration-300 cursor-pointer scale-90 hover:scale-95 z-10"
          >
            <img
              src={prevStoryImg}
              alt="Preview sebelumnya"
              className="w-[160px] h-[284px] object-contain bg-black rounded-2xl border border-white/20 shadow-2xl blur-[0.8px]"
            />
            <span className="text-xs text-white/70 font-semibold tracking-wide uppercase truncate max-w-[150px]">
              {prevStoryLabel}
            </span>
          </div>
        )}

        {/* ── TOMBOL NAVIGASI KIRI (Chevron) ── */}
        {(currentIndex > 0 || currentGroupIndex > 0) && (
          <button
            onClick={goPrev}
            className="absolute -left-14 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg cursor-pointer z-20"
            aria-label="Story sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* ── CENTRAL CONTAINER: Story Aktif (9:16 Aspect Ratio) diperbesar ke 92vh ── */}
        <div className="relative h-[92vh] max-h-[920px] aspect-[9/16] w-auto bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between z-10">
          
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
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          )}
          <img
            src={currentStory.imageUrl}
            alt={`Story slide ${currentIndex + 1}`}
            className="w-full h-full object-contain bg-black select-none"
            draggable="false"
            onLoad={() => setIsImageLoaded(true)}
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
        {nextStoryImg && (
          <div 
            onClick={goNext}
            className="absolute -right-64 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-35 hover:opacity-60 transition-all duration-300 cursor-pointer scale-90 hover:scale-95 z-10"
          >
            <img
              src={nextStoryImg}
              alt="Preview berikutnya"
              className="w-[160px] h-[284px] object-contain bg-black rounded-2xl border border-white/20 shadow-2xl blur-[0.8px]"
            />
            <span className="text-xs text-white/70 font-semibold tracking-wide uppercase truncate max-w-[150px]">
              {nextStoryLabel}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}