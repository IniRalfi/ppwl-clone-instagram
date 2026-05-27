import { useMemo, useState } from "react";
import { Search, X, Heart, MessageCircle } from "lucide-react";
import { dummyExplorePosts, dummySearchUsers } from "../lib/mockData";

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

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];

    return dummySearchUsers.filter((user) => {
      const search = query.toLowerCase();

      return (
        user.username.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search)
      );
    });
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-ig-background text-ig-text px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-ig-secondary-bg border border-neutral-800 rounded-xl py-3 pl-11 pr-11 outline-none focus:border-ig-primary text-sm"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => alert(`Go to profile: ${user.username}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ig-secondary-bg transition"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="text-left">
                    <p className="font-semibold text-sm">
                      {user.username}
                    </p>

                    <p className="text-sm text-neutral-400">
                      {user.name}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-neutral-400 py-10">
                No users found.
              </div>
            )}
          </div>
        ) : (
          /* Explore Grid */
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {dummyExplorePosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square overflow-hidden group cursor-pointer bg-ig-secondary-bg"
              >
                <img
                  src={
                    post.imageUrl ||
                    "https://via.placeholder.com/500"
                  }
                  alt={post.content}
                  className="w-full h-full object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 font-semibold">
                    <Heart size={20} fill="white" />
                    <span>{post._count.likes}</span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold">
                    <MessageCircle size={20} fill="white" />
                    <span>{post._count.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;