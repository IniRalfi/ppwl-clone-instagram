// frontend/src/pages/ProfilePage.tsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";
import { deletePost } from "../services/post.service";
import { toast } from "sonner";
import { Trash2, Loader2, UserPlus, Check, MessageSquare, Grid3X3, Bookmark } from "lucide-react";
import { apiClient } from "../services/api.client";
import { ProfileGridSkeleton } from "../components/ui/Skeleton";

// Import Modals yang telah dipisah
import { EditProfileModal } from "../components/profile/EditProfileModal";
import { FollowersModal } from "../components/profile/FollowersModal";
import { FollowingModal } from "../components/profile/FollowingModal";

// Story imports
import { getActiveStories } from "../services/story.service";
import type { UserStoryGroup } from "../components/story/StoriesRow";
import StoryViewer from "../components/story/StoryViewer";
import StoryEditorModal from "../components/story/StoryEditorModal";

// ─────────────────────────────────────────────
// Tipe
// ─────────────────────────────────────────────
interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  _count?: {
    likes: number;
    comments: number;
  };
}

interface FollowStats {
  followers: number;
  following: number;
}

interface ProfileUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

// ─────────────────────────────────────────────
// Sub-komponen: Empty state saved
// ─────────────────────────────────────────────
function SavedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      {/* Ikon Bookmark besar */}
      <div className="w-16 h-16 rounded-full border-2 border-ig-text flex items-center justify-center mb-2">
        <Bookmark className="w-8 h-8 text-ig-text" />
      </div>
      <p className="text-ig-text text-xl font-semibold">Simpan Postingan</p>
      <p className="text-ig-secondary-text text-sm text-center max-w-[260px]">
        Simpan foto yang ingin kamu lihat lagi. Tidak ada yang akan diberi tahu.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Halaman Utama Profile
// ─────────────────────────────────────────────
export default function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const loggedInUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Tab State untuk Disimpan (Saved Posts)
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(false);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  // Story & Popup States
  const [stories, setStories] = useState<UserStoryGroup[]>([]);
  const [myStoryGroup, setMyStoryGroup] = useState<UserStoryGroup | null>(null);
  const [isStoryMenuOpen, setIsStoryMenuOpen] = useState(false);
  const [selectedStoryFile, setSelectedStoryFile] = useState<File | null>(null);
  const [viewStoriesActive, setViewStoriesActive] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !username || username === loggedInUser?.username;

  const loadActiveStories = async () => {
    if (!loggedInUser) return;
    try {
      const res = await getActiveStories();
      setStories(res);
      const found = res.find((group) => group.userId === loggedInUser.id);
      if (found) {
        setMyStoryGroup(found);
      } else {
        setMyStoryGroup(null);
      }
    } catch (err) {
      console.error("Gagal memuat active stories di profil:", err);
    }
  };

  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedStoryFile(file);
    }
  };

  useEffect(() => {
    loadActiveStories();
  }, [loggedInUser]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        let activeUser: ProfileUser | null = null;
        if (isOwnProfile) {
          if (loggedInUser) {
            activeUser = {
              id: loggedInUser.id,
              username: loggedInUser.username,
              name: loggedInUser.name,
              avatarUrl: loggedInUser.avatarUrl ?? null,
              bio: loggedInUser.bio ?? null,
            };
          }
        } else if (username) {
          const userRes = await apiClient.get<{ data: ProfileUser }>(`/users/username/${username}`);
          if (userRes && userRes.data) {
            activeUser = userRes.data;
          }
        }

        if (!activeUser) {
          setProfileUser(null);
          setIsLoading(false);
          return;
        }

        setProfileUser(activeUser);

        // Fetch postingan milik user
        const postsRes = await apiClient.get<{ data: Post[] }>(`/posts?authorId=${activeUser.id}`);
        if (postsRes && postsRes.data) {
          setMyPosts(postsRes.data);
        } else {
          setMyPosts([]);
        }

        // Fetch jumlah followers & following dari API + status follow
        const params = loggedInUser?.id ? `?currentUserId=${loggedInUser.id}` : "";
        const statsRes = await apiClient.get<{
          followers: number;
          following: number;
          isFollowing: boolean;
        }>(`/follow/stats/${activeUser.id}${params}`);
        
        if (statsRes) {
          setFollowStats({
            followers: statsRes.followers,
            following: statsRes.following,
          });
          setIsFollowing(statsRes.isFollowing);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        setProfileUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username, loggedInUser, isOwnProfile]);

  // Fetch saved posts secara dinamis saat tab saved aktif
  useEffect(() => {
    if (activeTab === "saved" && isOwnProfile) {
      const fetchSavedPosts = async () => {
        setIsSavedLoading(true);
        try {
          const res = await apiClient.get<{ data: Post[] }>("/posts/saved");
          if (res && res.data) {
            setSavedPosts(res.data);
          } else {
            setSavedPosts([]);
          }
        } catch (error) {
          console.error("Gagal mengambil saved posts:", error);
          toast.error("Gagal memuat postingan yang disimpan.");
        } finally {
          setIsSavedLoading(false);
        }
      };
      fetchSavedPosts();
    }
  }, [activeTab, isOwnProfile]);

  // ── Handler Simpan Edit Profil ──
  const handleSaveProfile = async (data: {
    name: string;
    bio: string;
    avatarUrl: string;
    image?: File;
  }) => {
    try {
      let res;
      if (data.image) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("bio", data.bio);
        formData.append("avatarUrl", data.avatarUrl);
        formData.append("image", data.image);
        res = await apiClient.putForm<{ data: ProfileUser }>("/users/profile", formData);
      } else {
        res = await apiClient.put<{ data: ProfileUser }>("/users/profile", {
          name: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        });
      }

      if (res && res.data) {
        // Sync ke Zustand store
        updateUser({
          name: res.data.name,
          bio: res.data.bio ?? "",
          avatarUrl: res.data.avatarUrl ?? "",
        });
        
        // Sync ke state lokal
        setProfileUser((prev) =>
          prev ? { ...prev, name: res.data.name, bio: res.data.bio, avatarUrl: res.data.avatarUrl } : null
        );

        toast.success("Profil berhasil diperbarui!");
      }
    } catch (err) {
      toast.error("Gagal memperbarui profil.");
      throw err;
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!loggedInUser) return;
    const confirmed = window.confirm("Yakin ingin menghapus postingan ini?");
    if (!confirmed) return;

    setDeletingId(postId);
    try {
      await deletePost(postId, loggedInUser.id);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Postingan berhasil dihapus.");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menghapus postingan.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handler Follow/Unfollow ──
  const handleFollowToggle = async () => {
    if (!loggedInUser || !profileUser || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await apiClient.delete("/follow", {
          followerId: loggedInUser.id,
          followingId: profileUser.id,
        });
        setIsFollowing(false);
        setFollowStats((prev) => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        toast.success(`Batal mengikuti @${profileUser.username}`);
      } else {
        // Follow
        await apiClient.post("/follow", {
          followerId: loggedInUser.id,
          followingId: profileUser.id,
        });
        setIsFollowing(true);
        setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
        toast.success(`Mengikuti @${profileUser.username} 🎉`);
      }
    } catch {
      toast.error("Gagal memperbarui status ikuti.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4 py-8">
        <ProfileGridSkeleton />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ig-background gap-4 text-ig-text">
        <p className="text-neutral-500">Pengguna tidak ditemukan atau silakan login terlebih dahulu.</p>
        <Link to="/" className="text-ig-primary font-semibold hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4 text-ig-text">

      {/* ── Header Profil ── */}
      <div className="flex items-start gap-8 py-8 border-b border-ig-border">

        {/* Avatar Besar */}
        <Avatar name={profileUser.name} avatarUrl={profileUser.avatarUrl} size="lg" />

        {/* Info Profil */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-ig-text text-xl font-semibold">
              {profileUser.username}
            </h1>
            {isOwnProfile ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-8 py-1.5 text-ig-text text-sm font-semibold bg-ig-elevated-bg border border-ig-border rounded-lg hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer"
                >
                  Edit Profil
                </button>
                <button
                  onClick={() => {
                    logout();
                    toast.success("Berhasil keluar! 👋");
                    navigate("/login");
                  }}
                  className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-elevated-bg border border-ig-border rounded-lg hover:bg-red-950/20 hover:text-red-500 transition-all active:scale-95 cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`px-6 py-1.5 text-sm font-semibold rounded-lg transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                    isFollowing
                      ? "bg-ig-elevated-bg hover:opacity-80 text-ig-text"
                      : "bg-ig-primary hover:bg-ig-primary-hover text-white"
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <Check className="h-4 w-4" />
                      Mengikuti
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Ikuti
                    </>
                  )}
                </button>
                <Link
                  to="/messages"
                  className="px-6 py-1.5 text-sm font-semibold bg-ig-elevated-bg text-ig-text rounded-lg hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Kirim Pesan
                </Link>
              </div>
            )}
          </div>

          {/* Statistik: Postingan, Followers, Following */}
          <div className="flex gap-8 mb-4">
            <div>
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
            <button
              onClick={() => setIsFollowersModalOpen(true)}
              className="hover:opacity-70 transition-opacity text-left cursor-pointer bg-transparent border-none p-0"
            >
              <span className="text-ig-text font-semibold">{followStats.followers}</span>
              <span className="text-ig-text text-sm ml-1">pengikut</span>
            </button>
            <button
              onClick={() => setIsFollowingModalOpen(true)}
              className="hover:opacity-70 transition-opacity text-left cursor-pointer bg-transparent border-none p-0"
            >
              <span className="text-ig-text font-semibold">{followStats.following}</span>
              <span className="text-ig-text text-sm ml-1">mengikuti</span>
            </button>
          </div>

          {/* Nama + Bio */}
          <p className="text-ig-text text-sm font-semibold">{profileUser.name}</p>
          {profileUser.bio ? (
            <p className="text-ig-text text-sm mt-1 whitespace-pre-line">
              {profileUser.bio}
            </p>
          ) : (
            <p className="text-ig-secondary-text text-sm mt-1 italic">
              Belum ada bio.
            </p>
          )}
        </div>
      </div>

      {/* ── Cerita Baru (+ Story) ── */}
      {isOwnProfile && (
        <div className="flex gap-6 py-6 px-4 border-b border-neutral-800">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => setIsStoryMenuOpen(true)}>
            <div className="w-[66px] h-[66px] rounded-full border border-neutral-700 bg-neutral-900/60 flex items-center justify-center transition-all group-hover:bg-neutral-800 active:scale-95 shadow-sm">
              <span className="text-neutral-400 text-3xl font-light leading-none">+</span>
            </div>
            <span className="text-ig-text text-xs font-semibold">Baru</span>
          </div>

          <input
            type="file"
            ref={storyFileInputRef}
            onChange={handleStoryFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* ── Tab Navigation (Hanya jika milik sendiri) ── */}
      {isOwnProfile && (
        <div className="flex border-b border-neutral-850 justify-center">
          {/* Tab: POSTINGAN */}
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors -mb-px ${
              activeTab === "posts"
                ? "text-ig-text border-t border-ig-text"
                : "text-ig-secondary-text hover:text-ig-text border-t border-transparent"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Postingan
          </button>

          {/* Tab: DISIMPAN */}
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors -mb-px ${
              activeTab === "saved"
                ? "text-ig-text border-t border-ig-text"
                : "text-ig-secondary-text hover:text-ig-text border-t border-transparent"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Disimpan
          </button>
        </div>
      )}

      {/* ── Konten Tab ── */}
      <div className="py-4">
        {/* TAB: POSTINGAN */}
        {activeTab === "posts" && (
          myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-4xl">📷</span>
              <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
              {isOwnProfile && (
                <>
                  <p className="text-ig-secondary-text text-sm">
                    Mulai bagikan foto pertamamu!
                  </p>
                  <Link
                    to="/create"
                    className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80"
                  >
                    Buat Postingan
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px]">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-[4/5] overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <Link to={`/posts/${post.id}`} className="block w-full h-full">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.content}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                        <span className="text-ig-secondary-text text-xs text-center px-2 line-clamp-3">
                          {post.content}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Overlay Hover — stats + tombol hapus */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-4">
                      <span className="text-white text-sm font-semibold">
                        ❤️ {post._count?.likes ?? 0}
                      </span>
                      <span className="text-white text-sm font-semibold">
                        💬 {post._count?.comments ?? 0}
                      </span>
                    </div>

                    {isOwnProfile && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingId === post.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors border-none cursor-pointer disabled:opacity-60"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB: DISIMPAN */}
        {activeTab === "saved" && isOwnProfile && (
          isSavedLoading ? (
            <p className="text-ig-secondary-text text-sm text-center py-8">
              Memuat postingan tersimpan...
            </p>
          ) : savedPosts.length === 0 ? (
            <SavedEmptyState />
          ) : (
            <div className="grid grid-cols-3 gap-[2px]">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-[4/5] overflow-hidden group cursor-pointer"
                >
                  <Link to={`/posts/${post.id}`} className="block w-full h-full">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.content}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                        <span className="text-ig-secondary-text text-xs text-center px-2 line-clamp-3">
                          {post.content}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-4">
                      <span className="text-white text-sm font-semibold">
                        ❤️ {post._count?.likes ?? 0}
                      </span>
                      <span className="text-white text-sm font-semibold">
                        💬 {post._count?.comments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Modals ── */}
      {isEditModalOpen && (
        <EditProfileModal
          initialName={profileUser.name}
          initialUsername={profileUser.username}
          initialBio={profileUser.bio ?? ""}
          initialAvatarUrl={profileUser.avatarUrl ?? ""}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
      {isFollowersModalOpen && (
        <FollowersModal
          userId={profileUser.id}
          loggedInUserId={loggedInUser?.id}
          onClose={() => setIsFollowersModalOpen(false)}
          onFollowStatsChange={(stats) => setFollowStats((prev) => ({ ...prev, ...stats }))}
        />
      )}
      {isFollowingModalOpen && (
        <FollowingModal
          userId={profileUser.id}
          loggedInUserId={loggedInUser?.id}
          onClose={() => setIsFollowingModalOpen(false)}
          onFollowStatsChange={(stats) => setFollowStats((prev) => ({ ...prev, ...stats }))}
        />
      )}

      {/* ── Story Menu Popup ── */}
      {isStoryMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setIsStoryMenuOpen(false)}
        >
          <div
            className="w-full max-w-[340px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-4 border-b border-ig-border text-center">
              <span className="text-ig-text font-bold text-sm">Cerita & Konten</span>
            </div>
            <div className="flex flex-col text-center">
              {myStoryGroup && myStoryGroup.stories.length > 0 && (
                <button
                  onClick={() => {
                    setIsStoryMenuOpen(false);
                    setViewStoriesActive(true);
                  }}
                  className="w-full py-3.5 text-ig-text text-sm font-semibold hover:bg-neutral-800 transition-colors border-b border-ig-border cursor-pointer bg-transparent border-none"
                >
                  Lihat Cerita
                </button>
              )}
              <button
                onClick={() => {
                  setIsStoryMenuOpen(false);
                  storyFileInputRef.current?.click();
                }}
                className="w-full py-3.5 text-ig-text text-sm font-semibold hover:bg-neutral-800 transition-colors border-b border-ig-border cursor-pointer bg-transparent border-none"
              >
                Buat Cerita Baru
              </button>
              <button
                onClick={() => {
                  setIsStoryMenuOpen(false);
                  navigate("/create");
                }}
                className="w-full py-3.5 text-ig-text text-sm font-semibold hover:bg-neutral-800 transition-colors border-b border-ig-border cursor-pointer bg-transparent border-none"
              >
                Buat Postingan Baru
              </button>
              <button
                onClick={() => setIsStoryMenuOpen(false)}
                className="w-full py-3.5 text-ig-secondary-text text-sm hover:bg-neutral-800 transition-colors cursor-pointer bg-transparent border-none"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Story Editor Modal ── */}
      {selectedStoryFile && (
        <StoryEditorModal
          imageFile={selectedStoryFile}
          onClose={() => setSelectedStoryFile(null)}
          onUploadSuccess={() => {
            setSelectedStoryFile(null);
            loadActiveStories();
            toast.success("Cerita berhasil diunggah! 🚀");
          }}
        />
      )}

      {/* ── Story Viewer Modal ── */}
      {viewStoriesActive && myStoryGroup && (
        <StoryViewer
          groups={stories}
          initialGroupId={myStoryGroup.userId}
          onClose={() => setViewStoriesActive(false)}
        />
      )}
    </div>
  );
}
