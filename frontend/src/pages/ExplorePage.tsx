import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Heart, MessageCircle, Loader2 } from "lucide-react";
import { apiClient } from "../services/api.client";

export interface SearchUserResult {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface ExplorePost {
  id: string;
  imageUrl: string | null;
  content: string;
  _count: {
    likes: number;
    comments: number;
  };
}

const ExplorePage = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [explorePosts, setExplorePosts] = useState<ExplorePost[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  // Fetch explore posts on mount
  useEffect(() => {
    const fetchExplorePosts = async () => {
      setIsPostsLoading(true);
      try {
        const res = await apiClient.get<{ data: ExplorePost[] }>("/posts");
        if (res && res.data) {
          setExplorePosts(res.data);
        }
      } catch (err) {
        console.error("Gagal mengambil postingan explore:", err);
      } finally {
        setIsPostsLoading(false);
      }
    };
    fetchExplorePosts();
  }, []);

  // Debounced search for users
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await apiClient.get<{ data: SearchUserResult[] }>(
          `/users?search=${encodeURIComponent(query)}`
        );
        if (res && res.data) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Gagal melakukan pencarian user:", err);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-ig-background text-ig-text px-4 py-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
          />

          <input
            type="text"
            placeholder="Cari pengguna berdasarkan nama atau username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-ig-elevated-bg border border-ig-border rounded-xl py-3 pl-12 pr-12 outline-none focus:border-ig-primary text-[15px] transition-colors placeholder:text-neutral-500"
          />

          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isSearchLoading && (
                <Loader2 size={16} className="text-neutral-500 animate-spin" />
              )}
              <button
                onClick={() => setQuery("")}
                className="text-neutral-500 hover:text-ig-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="space-y-2 bg-ig-elevated-bg border border-ig-border rounded-xl p-2 max-h-[500px] overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-ig-secondary-bg transition-colors"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover bg-neutral-800"
                  />

                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-ig-secondary-text truncate">
                      {user.name}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              !isSearchLoading && (
                <div className="text-center text-ig-secondary-text py-12">
                  Tidak ada pengguna ditemukan untuk "{query}"
                </div>
              )
            )}
            {isSearchLoading && searchResults.length === 0 && (
              <div className="flex items-center justify-center py-12 text-ig-secondary-text gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Mencari...</span>
              </div>
            )}
          </div>
        ) : (
          /* Explore Grid */
          <div>
            {isPostsLoading ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-ig-elevated-bg rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : explorePosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {explorePosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="relative aspect-square overflow-hidden group cursor-pointer bg-ig-elevated-bg rounded-lg"
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.content}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center p-3">
                        <span className="text-xs text-ig-secondary-text line-clamp-3 text-center">
                          {post.content}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <Heart size={20} fill="white" />
                        <span>{post._count?.likes ?? 0}</span>
                      </div>

                      <div className="flex items-center gap-2 font-semibold text-white">
                        <MessageCircle size={20} fill="white" />
                        <span>{post._count?.comments ?? 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-ig-secondary-text py-20 bg-ig-elevated-bg border border-ig-border rounded-xl">
                <span className="text-4xl block mb-2">📸</span>
                <p className="font-semibold text-ig-text">Belum ada postingan</p>
                <p className="text-sm">Jelajahi kembali nanti saat pengguna lain mulai membagikan foto.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;