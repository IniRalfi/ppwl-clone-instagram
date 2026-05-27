// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";
import { deletePost } from "../services/post.service";
import { toast } from "sonner";
import { Trash2, Loader2, X, Grid3X3, Bookmark } from "lucide-react";
import { apiClient } from "../services/api.client";
import {
  dummyFollowers,
  dummyFollowing,
  dummySavedPosts,
  type FollowUser,
  type SavedPost,
} from "../lib/mockData";

// ─────────────────────────────────────────────
// Tipe
// ─────────────────────────────────────────────
interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  _count?: { likes: number; comments: number };
}

interface FollowStats {
  followers: number;
  following: number;
}

// ─────────────────────────────────────────────
// Sub-komponen: Modal Followers
// ─────────────────────────────────────────────
function FollowersModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<FollowUser[]>(dummyFollowers);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-ig-secondary-bg border border-neutral-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <span className="text-ig-text font-semibold text-sm">Pengikut</span>
          <button onClick={onClose} className="text-ig-text hover:opacity-60 transition-opacity"><X size={20} /></button>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-ig-secondary-text text-sm text-center py-8">Belum ada pengikut.</p>
          ) : list.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
              <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-ig-text text-sm font-semibold truncate">{u.username}</p>
                <p className="text-ig-secondary-text text-xs truncate">{u.name}</p>
              </div>
              <button onClick={() => setList((prev) => prev.filter((x) => x.id !== u.id))}
                className="text-ig-text text-xs font-semibold px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors shrink-0">
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-komponen: Modal Following
// ─────────────────────────────────────────────
function FollowingModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<FollowUser[]>(dummyFollowing);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-ig-secondary-bg border border-neutral-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <span className="text-ig-text font-semibold text-sm">Mengikuti</span>
          <button onClick={onClose} className="text-ig-text hover:opacity-60 transition-opacity"><X size={20} /></button>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-ig-secondary-text text-sm text-center py-8">Belum mengikuti siapapun.</p>
          ) : list.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
              <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-ig-text text-sm font-semibold truncate">{u.username}</p>
                <p className="text-ig-secondary-text text-xs truncate">{u.name}</p>
              </div>
              <button
                onClick={() => setList((prev) => prev.map((x) => x.id === u.id ? { ...x, isFollowingBack: !x.isFollowingBack } : x))}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  u.isFollowingBack
                    ? "bg-neutral-700 hover:bg-neutral-600 text-ig-text"
                    : "bg-ig-primary hover:opacity-80 text-white"
                }`}
              >
                {u.isFollowingBack ? "Mengikuti" : "Ikuti"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-komponen: Modal Edit Profil
// ─────────────────────────────────────────────
interface EditProfileProps {
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
  onClose: () => void;
  onSave: (data: { name: string; username: string; bio: string; avatarUrl: string }) => void;
}

function EditProfileModal({ initialName, initialUsername, initialBio, initialAvatarUrl, onClose, onSave }: EditProfileProps) {
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-ig-secondary-bg border border-neutral-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <span className="text-ig-text font-semibold text-sm">Edit Profil</span>
          <button onClick={onClose} className="text-ig-text hover:opacity-60 transition-opacity"><X size={20} /></button>
        </div>
        <div className="px-4 py-4 flex flex-col gap-4">
          {[
            { label: "Nama Lengkap", value: name, set: setName, placeholder: "Nama lengkap" },
            { label: "Username", value: username, set: setUsername, placeholder: "username" },
            { label: "URL Foto Profil", value: avatarUrl, set: setAvatarUrl, placeholder: "https://..." },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-ig-secondary-text text-xs font-semibold">{label}</label>
              <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tulis bio kamu..." rows={3}
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors resize-none" />
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={onClose} className="flex-1 py-2 text-ig-text text-sm font-semibold bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors">Batal</button>
          <button
            onClick={() => {
              if (!name.trim() || !username.trim()) { toast.error("Nama dan username tidak boleh kosong."); return; }
              onSave({ name: name.trim(), username: username.trim(), bio: bio.trim(), avatarUrl: avatarUrl.trim() });
            }}
            className="flex-1 py-2 text-white text-sm font-semibold bg-ig-primary hover:opacity-80 rounded-lg transition-opacity"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-komponen: Grid item saved post
// ─────────────────────────────────────────────
function SavedPostItem({ post }: { post: SavedPost }) {
  return (
    <div className="relative aspect-square overflow-hidden group cursor-pointer">
      {post.imageUrl ? (
        <img src={post.imageUrl} alt={post.content}
          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-200" />
      ) : (
        <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
          <span className="text-ig-secondary-text text-xs text-center px-2 line-clamp-3">{post.content}</span>
        </div>
      )}

      {/* Hover overlay — sama persis dengan tab Postingan */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex gap-4">
          <span className="text-white text-sm font-semibold">❤️ {post._count.likes}</span>
          <span className="text-white text-sm font-semibold">💬 {post._count.comments}</span>
        </div>
      </div>
    </div>
  );
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
// Halaman Utama
// ─────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  const [profileData, setProfileData] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    avatarUrl: user?.avatarUrl ?? "",
  });

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followers: dummyFollowers.length,
    following: dummyFollowing.length,
  });

  // ── LANGKAH 2: State tab aktif ──
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${import.meta.env.VITE_API_URL}/posts`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setMyPosts(json.data.filter((p: Post) => p.authorId === user.id));
      })
      .finally(() => setIsLoading(false));

    apiClient.get<{ followers: number; following: number }>(`/follow/stats/${user.id}`)
      .then((data) => setFollowStats(data))
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = (data: { name: string; username: string; bio: string; avatarUrl: string }) => {
    setProfileData(data);
    try {
      const raw = localStorage.getItem("user");
      if (raw) localStorage.setItem("user", JSON.stringify({ ...JSON.parse(raw), ...data }));
    } catch {}
    toast.success("Profil berhasil diperbarui!");
    setIsEditModalOpen(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (!window.confirm("Yakin ingin menghapus postingan ini?")) return;
    setDeletingId(postId);
    try {
      await deletePost(postId, user.id);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Postingan berhasil dihapus.");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menghapus postingan.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ig-background">
        <p className="text-neutral-500">Silakan login terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4">

      {/* ── Header Profil ── */}
      <div className="flex items-start gap-8 py-8 border-b border-ig-border">
        <Avatar name={profileData.name} avatarUrl={profileData.avatarUrl || null} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-ig-text text-xl font-semibold">{profileData.username}</h1>
            <button onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-elevated-bg rounded-lg hover:opacity-80 transition-opacity">
              Edit Profil
            </button>
            <button onClick={logout} className="text-ig-secondary-text text-sm hover:text-ig-text transition-colors">
              Keluar
            </button>
          </div>
          <div className="flex gap-8 mb-4">
            <div>
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
            <button onClick={() => setIsFollowersModalOpen(true)} className="hover:opacity-70 transition-opacity text-left">
              <span className="text-ig-text font-semibold">{followStats.followers}</span>
              <span className="text-ig-text text-sm ml-1">pengikut</span>
            </button>
            <button onClick={() => setIsFollowingModalOpen(true)} className="hover:opacity-70 transition-opacity text-left">
              <span className="text-ig-text font-semibold">{followStats.following}</span>
              <span className="text-ig-text text-sm ml-1">mengikuti</span>
            </button>
          </div>
          <p className="text-ig-text text-sm font-semibold">{profileData.name}</p>
          {profileData.bio
            ? <p className="text-ig-text text-sm mt-1 whitespace-pre-line">{profileData.bio}</p>
            : <p className="text-ig-secondary-text text-sm mt-1 italic">Belum ada bio.</p>
          }
        </div>
      </div>

      {/* ── LANGKAH 2: Tab Navigation ── */}
      <div className="flex border-b border-neutral-800">
        {/* Tab: POSTINGAN */}
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
            activeTab === "posts"
              ? "text-ig-text border-t-2 border-ig-text -mt-px"    // garis atas = aktif
              : "text-ig-secondary-text hover:text-ig-text border-t-2 border-transparent -mt-px"
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          Postingan
        </button>

        {/* Tab: DISIMPAN */}
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
            activeTab === "saved"
              ? "text-ig-text border-t-2 border-ig-text -mt-px"
              : "text-ig-secondary-text hover:text-ig-text border-t-2 border-transparent -mt-px"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Disimpan
        </button>
      </div>

      {/* ── Konten Tab ── */}
      <div className="py-4">

        {/* ── TAB: POSTINGAN ── */}
        {activeTab === "posts" && (
          <>
            {isLoading ? (
              <p className="text-ig-secondary-text text-sm text-center py-8">Memuat postingan...</p>
            ) : myPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <span className="text-4xl">📷</span>
                <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
                <p className="text-ig-secondary-text text-sm">Mulai bagikan foto pertamamu!</p>
                <Link to="/create" className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80">
                  Buat Postingan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[2px]">
                {myPosts.map((post) => (
                  <div key={post.id} className="relative aspect-square overflow-hidden group">
                    <Link to={`/posts/${post.id}`} className="block w-full h-full">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.content}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                      ) : (
                        <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                          <span className="text-ig-secondary-text text-xs text-center px-2 line-clamp-3">{post.content}</span>
                        </div>
                      )}
                    </Link>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <div className="flex gap-4">
                        <span className="text-white text-sm font-semibold">❤️ {post._count?.likes ?? 0}</span>
                        <span className="text-white text-sm font-semibold">💬 {post._count?.comments ?? 0}</span>
                      </div>
                      <button onClick={() => handleDeletePost(post.id)} disabled={deletingId === post.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors border-none cursor-pointer disabled:opacity-60">
                        {deletingId === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── LANGKAH 3: TAB DISIMPAN ── */}
        {activeTab === "saved" && (
          <>
            {dummySavedPosts.length === 0 ? (
              <SavedEmptyState />
            ) : (
              <div className="grid grid-cols-3 gap-[2px]">
                {dummySavedPosts.map((post) => (
                  <SavedPostItem key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {isEditModalOpen && (
        <EditProfileModal
          initialName={profileData.name} initialUsername={profileData.username}
          initialBio={profileData.bio} initialAvatarUrl={profileData.avatarUrl}
          onClose={() => setIsEditModalOpen(false)} onSave={handleSaveProfile}
        />
      )}
      {isFollowersModalOpen && <FollowersModal onClose={() => setIsFollowersModalOpen(false)} />}
      {isFollowingModalOpen && <FollowingModal onClose={() => setIsFollowingModalOpen(false)} />}
    </div>
  );
}