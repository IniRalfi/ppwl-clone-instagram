import React from 'react';
import { PostCard } from '../components/post/PostCard'; 
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { usePosts } from "../hooks/usePosts";
import { PlusSquare } from "lucide-react";

const HomePage: React.FC = () => {
  const { posts, isLoading, error } = usePosts();

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Berhasil log out.");
    navigate("/login");
  };

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex flex-col items-center">
      
      {/* 🔝 NAVBAR */}
      <div className="w-full h-14 border-b border-neutral-800 bg-ig-background flex items-center justify-center sticky top-0 z-50">
        <div className="w-full max-w-[550px] px-4 flex justify-between items-center">
          
          {/* Logo / Title */}
          <h1 className="text-xl font-bold">Clone Instagram</h1>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            <ThemeToggle />

            {/* ➕ CREATE POST */}
            <button
              onClick={() => navigate("/create")}
              className="text-ig-text hover:text-ig-primary transition"
            >
              <PlusSquare className="w-6 h-6" />
            </button>

            {/* LOGOUT */}
            <button 
              onClick={handleLogout}
              className="text-sm font-semibold text-red-500 hover:text-red-400 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* 📸 FEED */}
      <div className="w-full max-w-[550px] flex flex-col gap-5 px-3 sm:px-0 pt-6 pb-20">
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-neutral-400">
            Memuat postingan...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">
            Belum ada postingan.
          </div>
        ) : (
          posts.map((post) => {
            const timeAgo = new Date(post.createdAt).toLocaleDateString('id-ID', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <PostCard
                key={post.id}
                id={post.id}
                username={post.author.username}
                avatarUrl={post.author.avatarUrl || ''}
                imageUrls={post.imageUrl ? [post.imageUrl] : []}
                caption={post.content}
                likesCount={post._count?.likes ?? 0}
                timeAgo={timeAgo}
                postsCount="0"
                followers="0"
                following="0"
                bio="User"
              />
            );
          })
        )}

        {/* Footer */}
        {!isLoading && posts.length > 0 && (
          <div className="text-center text-neutral-500 text-sm mt-6 pb-8">
            ✓ Kamu sudah melihat semua postingan
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;