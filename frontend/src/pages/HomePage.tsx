import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/post/PostCard'; 
import { toast } from 'sonner';

// Tipe data sesuai dengan response dari backend
interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
        const json = await res.json();
        
        if (res.ok && json.data) {
          setPosts(json.data);
        } else {
          toast.error("Gagal mengambil data postingan dari server.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Tidak dapat terhubung ke server backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex flex-col items-center">
      <div className="w-full max-w-[550px] flex flex-col gap-5 px-3 sm:px-0 pt-6 pb-20">
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-ig-secondary-text">
            Memuat postingan...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-ig-secondary-text py-20">
            Belum ada postingan.
          </div>
        ) : (
          posts.map((post) => {
            const timeAgo = new Date(post.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            
            return (
              <PostCard
                key={post.id}
                id={post.id}
                username={post.author.username}
                avatarUrl={post.author.avatarUrl || ''}
                imageUrls={post.imageUrl ? [post.imageUrl] : []} 
                caption={post.content}
                likesCount={post._count.likes}
                timeAgo={timeAgo}
                postsCount="0"
                followers="0"
                following="0"
                bio="User"
              />
            );
          })
        )}
        
        {!isLoading && posts.length > 0 && (
          <div className="text-center text-ig-secondary-text text-sm mt-6 pb-8">
            ✓ Kamu sudah melihat semua postingan
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
