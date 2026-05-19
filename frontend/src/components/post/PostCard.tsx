import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Avatar from '../common/Avatar'; 

// 🌟 1. DEKLARASI TIPE DATA TAG AGAR BERJALAN AMAN DI TYPESCRIPT
interface PostTag {
  username: string;
  x: number;
  y: number;
}

interface PostCardProps {
  username: string;
  avatarUrl: string;
  imageUrls: string[]; 
  caption: string;
  likesCount: number;
  timeAgo: string;
  postsCount: string;
  followers: string;
  following: string;
  bio: string;
  tags?: PostTag[];
}

export const PostCard: React.FC<PostCardProps> = ({
  username, avatarUrl, imageUrls, caption, likesCount, timeAgo,
  postsCount, followers, following, bio, tags = []
}) => {
  // 🌟 State utama untuk memantau on/off label tag melayang
  const [showTags, setShowTags] = useState(false);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const maxLength = 60; 
  const shouldTruncate = caption.length > maxLength;
  const displayedCaption = isExpanded || !shouldTruncate ? caption : `${caption.substring(0, maxLength)}...`;
  const currentLikes = isLiked ? likesCount + 1 : likesCount;

  const handleDoubleClick = () => {
    setIsLiked(true);
    setShowHeartPop(true);
    setTimeout(() => { setShowHeartPop(false); }, 1500); 
  };

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ left: container.clientWidth * index, behavior: 'smooth' });
      setCurrentImgIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && !isDown.current) {
      const container = scrollContainerRef.current;
      const index = Math.round(container.scrollLeft / container.clientWidth);
      if (index !== currentImgIndex) setCurrentImgIndex(index);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageUrls.length <= 1 || !scrollContainerRef.current) return;
    isDown.current = true;
    setIsDragging(true);
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    if (!isDown.current || !scrollContainerRef.current) return;
    isDown.current = false;
    setIsDragging(false);
    const container = scrollContainerRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    scrollToImage(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Fungsi Cetak Hover Card Melayang saat Username di-hover
  const renderHoverCard = (isFooter = false) => (
    <div className={`absolute left-0 w-[300px] bg-ig-background border border-ig-border rounded-xl p-4 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 text-left normal-case font-normal ${
      isFooter ? 'bottom-6' : 'top-6'
    }`}>
      <div className="flex items-center space-x-3 mb-4">
        <Avatar src={avatarUrl} fallback={username[0].toUpperCase()} className="h-14 w-14 border border-ig-border bg-ig-secondary-bg" />
        <div>
          <div className="font-bold text-ig-text text-[15px]">{username}</div>
          <div className="text-xs text-ig-secondary-text max-w-[180px] truncate">{bio}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center border-t border-b border-ig-border py-3 mb-4">
        <div>
          <div className="font-bold text-sm text-ig-text">{postsCount}</div>
          <div className="text-[11px] text-ig-secondary-text">posts</div>
        </div>
        <div>
          <div className="font-bold text-sm text-ig-text">{followers}</div>
          <div className="text-[11px] text-ig-secondary-text">followers</div>
        </div>
        <div>
          <div className="font-bold text-sm text-ig-text">{following}</div>
          <div className="text-[11px] text-ig-secondary-text">following</div>
        </div>
      </div>
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm py-2 rounded-lg transition-colors cursor-pointer text-center block border-none">
        Follow
      </button>
    </div>
  );

  return (
    <Card className="w-full border-none bg-ig-background text-ig-text rounded-none sm:rounded-lg overflow-hidden text-left relative">
      
      {/* ================= HEADER POSTINGAN ================= */}
      <div className="flex items-center justify-between px-4 py-3 relative">
        <div className="flex items-center space-x-3">
          <Avatar src={avatarUrl} fallback={username[0].toUpperCase()} className="h-9 w-9 border border-ig-border bg-ig-secondary-bg" />
          
          <div className="flex items-baseline space-x-2 relative group">
            <span className="font-semibold text-[15px] text-ig-text hover:text-ig-secondary-text cursor-pointer">
              {username}
            </span>
            <span className="text-xs text-ig-secondary-text">• {timeAgo}</span>
            {renderHoverCard(false)}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent rounded-full h-8 w-8 p-0 flex items-center justify-center">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* ================= BODY: CAROUSEL GESER ================= */}
      <div 
        className="relative w-full overflow-hidden bg-black flex items-center justify-center aspect-square sm:aspect-auto" 
        onDoubleClick={handleDoubleClick}
        onClick={() => setShowTags(!showTags)}
      >
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className={`w-full flex overflow-x-auto scrollbar-none select-none ${
            isDragging ? 'scroll-auto' : 'snap-x snap-mandatory scroll-smooth'
          } ${imageUrls.length > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          style={{ scrollbarWidth: 'none' }} 
        >
          {imageUrls.map((url, index) => (
            <div key={index} className="w-full flex-shrink-0 snap-center flex items-center justify-center pointer-events-none relative">
              <img src={url} alt={`Postingan ke-${index + 1}`} className="w-full h-auto max-h-[550px] object-contain select-none" draggable="false" />
              
              {/* TAG LABEL MELAYANG */}
              {index === 0 && showTags && tags.map((tag, tIdx) => (
                <div
                  key={tIdx}
                  className="absolute bg-ig-background/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg pointer-events-auto border border-ig-border animate-in fade-in zoom-in-95 duration-150 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-zinc-950/90"
                  style={{ 
                    left: `${tag.x}%`, 
                    top: `${tag.y}%`,
                    transform: 'translate(-50%, 0)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Menuju profil ${tag.username}`);
                  }}
                >
                  <span className="cursor-pointer hover:underline">{tag.username}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 🌟 IKON TOMBOL ORANG (TAG) DI POJOK KIRI BAWAH GAMBAR (Bebas dari teks lama) */}
        {tags.length > 0 && (
          <button 
            className={`absolute bottom-3 left-3 p-2 rounded-full transition-all duration-200 z-20 border-none cursor-pointer flex items-center justify-center backdrop-blur-sm ${
              showTags 
                ? 'bg-blue-500 text-white scale-105' 
                : 'bg-black/60 text-white/90 hover:bg-black/80 hover:scale-105'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowTags(!showTags);
            }}
          >
            <User className="h-4 w-4 fill-current" />
          </button>
        )}

        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none transition-all duration-1000 animate-in fade-in zoom-in-50">
            <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] transform scale-110" />
          </div>
        )}

        {imageUrls.length > 1 && (
          <>
            {currentImgIndex > 0 && (
              <button onClick={() => scrollToImage(currentImgIndex - 1)} className="absolute left-3 p-1 rounded-full bg-zinc-900/40 text-white/70 hover:bg-zinc-900/70 hover:text-white border-none cursor-pointer flex items-center justify-center z-10">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {currentImgIndex < imageUrls.length - 1 && (
              <button onClick={() => scrollToImage(currentImgIndex + 1)} className="absolute right-3 p-1 rounded-full bg-zinc-900/40 text-white/70 hover:bg-zinc-900/70 hover:text-white border-none cursor-pointer flex items-center justify-center z-10">
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 pointer-events-none z-10">
              {imageUrls.map((_, index) => (
                <div key={index} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === currentImgIndex ? 'bg-blue-500 w-2' : 'bg-zinc-500/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ================= FOOTER: TOMBOL + CAPTION ================= */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            {/* 1. TOMBOL LIKE */}
            <div className="flex items-center space-x-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsLiked(!isLiked)}
                className={`h-7 w-7 p-0 flex items-center justify-center hover:bg-transparent ${
                  isLiked ? 'text-red-500 hover:text-red-600' : 'text-ig-text hover:text-ig-secondary-text'
                }`}
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-sm font-semibold select-none text-ig-secondary-text">
                {currentLikes > 1000 ? `${(currentLikes / 1000).toFixed(1)}K` : currentLikes}
              </span>
            </div>

            {/* 2. TOMBOL COMMENT */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button variant="ghost" size="icon" className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-7 w-7 p-0 flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </Button>
              <span className="text-sm font-semibold select-none text-ig-secondary-text">6</span>
            </div>

            {/* 3. TOMBOL SHARE (PESAWAT) */}
            <div className="flex items-center space-x-1.5 text-ig-text">
              <Button variant="ghost" size="icon" className="text-ig-text hover:text-ig-secondary-text hover:bg-transparent h-7 w-7 p-0 flex items-center justify-center rotate-[-20deg]">
                <Send className="h-6 w-6" />
              </Button>
              <span className="text-sm font-semibold select-none text-ig-secondary-text">19</span>
            </div>

          </div>

          {/* 4. TOMBOL BOOKMARK */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`h-7 w-7 p-0 flex items-center justify-center hover:bg-transparent ${
              isBookmarked ? 'text-ig-text' : 'text-ig-text hover:text-ig-secondary-text'
            }`}
          >
            <Bookmark className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {/* CAPTION BOX */}
        <div className="text-[14px] leading-relaxed pt-1 border-t border-ig-border relative">
          <div>
            <span className="inline-block relative group mr-2">
              <span className="font-semibold cursor-pointer text-ig-text hover:underline">
                {username}
              </span>
              {renderHoverCard(true)}
            </span>

            <span className="text-ig-text whitespace-pre-wrap">{displayedCaption}</span>
            
            {shouldTruncate && !isExpanded && (
              <button onClick={() => setIsExpanded(true)} className="text-ig-secondary-text font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block">... more</button>
            )}
            {isExpanded && shouldTruncate && (
              <button onClick={() => setIsExpanded(false)} className="text-ig-secondary-text text-xs font-normal hover:text-ig-secondary-text ml-1 bg-transparent border-none p-0 cursor-pointer inline-block">(less)</button>
            )}
          </div>
        </div>
      </div>

    </Card>
  );
};

export default PostCard;