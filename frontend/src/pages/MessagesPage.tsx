import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  Search,
  Send,
  X,
  AlertTriangle,
} from "lucide-react";
import { MessagesPageSkeleton } from "../components/ui/PageState";
import { toast } from "sonner";
import { apiClient } from "../services/api.client";
import { useAuthStore } from "../store/auth.store";
import { useMessageStore } from "../store/message.store";
import {
  useDirectMessagesRealtime,
  type RealtimeMessagePayload,
} from "../hooks/useDirectMessagesRealtime";

interface ChatUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

interface ChatRoom {
  id: string;
  otherUser: ChatUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  roomId?: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface LocationState {
  user?: ChatUser;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return formatTime(value);
  if (days === 1) return "Kemarin";
  if (days < 7) return date.toLocaleDateString("id-ID", { weekday: "long" });
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getAvatar(user?: ChatUser | null) {
  if (!user) return "https://api.dicebear.com/7.x/initials/svg?seed=Instafy";
  return (
    user.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.username)}`
  );
}

export default function MessagesPage() {
  const { user } = useAuthStore(); // ❌ REMOVED: token (tidak dipakai lagi)
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUser = (location.state as LocationState | null)?.user;
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(searchParams.get("roomId"));
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(initialUser || null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const setActiveRoomId = useMessageStore((state) => state.setActiveRoomId);
  const fetchUnreadCount = useMessageStore((state) => state.fetchUnreadCount);
  const decrementUnread = useMessageStore((state) => state.decrementUnread);

  const roomById = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const markRoomAsRead = useCallback(
    async (roomId: string) => {
      try {
        const res = await apiClient.post<{ data: { updatedCount: number } }>(
          `/messages/${roomId}/read`,
          {}
        );
        if (res.data.updatedCount > 0) {
          decrementUnread(res.data.updatedCount);
        }
      } catch {
        // silent
      }
    },
    [decrementUnread]
  );

  const loadRooms = async () => {
    setIsRoomsLoading(true);
    setRoomsError(false);
    try {
      const res = await apiClient.get<{ data: ChatRoom[] }>("/messages/rooms");
      setRooms(res.data || []);
    } catch {
      setRoomsError(true);
    } finally {
      setIsRoomsLoading(false);
    }
  };

  const openRoom = async (room: ChatRoom) => {
    setSelectedRoomId(room.id);
    setSelectedUser(room.otherUser);
    setActiveRoomId(room.id);
    setSearchParams({ roomId: room.id });
    setIsMessagesLoading(true);
    try {
      const res = await apiClient.get<{ data: ChatMessage[] }>(`/messages/${room.id}`);
      setMessages(res.data || []);
      markRoomAsRead(room.id);
      scrollToBottom();
    } catch {
      toast.error("Gagal memuat percakapan.");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const openUser = async (targetUser: ChatUser) => {
    setSelectedUser(targetUser);
    setSelectedRoomId(null);
    setMessages([]);
    setSearch("");
    setSearchResults([]);
    setSearchParams({ userId: targetUser.id });
    setIsMessagesLoading(true);
    try {
      const res = await apiClient.get<{
        data: {
          room: { id: string; updatedAt: string } | null;
          otherUser: ChatUser;
          messages: ChatMessage[];
        };
      }>(`/messages/with/${targetUser.id}`);
      setSelectedUser(res.data.otherUser);
      setMessages(res.data.messages || []);
      if (res.data.room) {
        setSelectedRoomId(res.data.room.id);
        setActiveRoomId(res.data.room.id);
        setSearchParams({ roomId: res.data.room.id });
        markRoomAsRead(res.data.room.id);
      }
      scrollToBottom();
    } catch {
      toast.error("Gagal membuka chat.");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const openUserById = async (userId: string) => {
    setIsMessagesLoading(true);
    try {
      const res = await apiClient.get<{
        data: {
          room: { id: string; updatedAt: string } | null;
          otherUser: ChatUser;
          messages: ChatMessage[];
        };
      }>(`/messages/with/${userId}`);
      setSelectedUser(res.data.otherUser);
      setMessages(res.data.messages || []);
      if (res.data.room) {
        setSelectedRoomId(res.data.room.id);
        setActiveRoomId(res.data.room.id);
        setSearchParams({ roomId: res.data.room.id });
        markRoomAsRead(res.data.room.id);
      }
      scrollToBottom();
    } catch {
      toast.error("Gagal membuka chat.");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !selectedUser || isSending) return;
    setIsSending(true);
    try {
      const res = await apiClient.post<{ data: ChatMessage }>("/messages", {
        receiverId: selectedUser.id,
        text,
      });
      setDraft("");
      setMessages((prev) =>
        prev.some((item) => item.id === res.data.id) ? prev : [...prev, res.data]
      );
      if (res.data.roomId) {
        setSelectedRoomId(res.data.roomId);
        setSearchParams({ roomId: res.data.roomId });
      }
      await loadRooms();
      scrollToBottom();
    } catch {
      toast.error("Pesan gagal dikirim.");
    } finally {
      setIsSending(false);
    }
  };

  const goBack = () => {
    setSelectedUser(null);
    setSelectedRoomId(null);
    setMessages([]);
    setActiveRoomId(null);
    setSearchParams({});
  };

  useEffect(() => {
    loadRooms();
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!initialUser) return;
    openUser(initialUser);
  }, [initialUser?.id]);

  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || initialUser || selectedUser?.id === targetUserId) return;
    openUserById(targetUserId);
  }, [searchParams, initialUser, selectedUser?.id]);

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (!roomId || selectedRoomId === roomId) return;
    const room = roomById.get(roomId);
    if (room) openRoom(room);
  }, [searchParams, roomById, selectedRoomId]);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const res = await apiClient.get<{ data: ChatUser[] }>(
          `/users?search=${encodeURIComponent(query)}`
        );
        setSearchResults((res.data || []).filter((item) => item.id !== user?.id));
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, user?.id]);

  const handleRealtimeMessage = useCallback(
    (payload: RealtimeMessagePayload) => {
      if (payload.roomId === selectedRoomId) {
        setMessages((prev) =>
          prev.some((item) => item.id === payload.message.id) ? prev : [...prev, payload.message]
        );
        markRoomAsRead(payload.roomId);
        scrollToBottom();
      }
      loadRooms().catch(() => null);
    },
    [selectedRoomId, markRoomAsRead]
  );

  const handleRealtimeRead = useCallback(
    (payload: { roomId: string }) => {
      if (payload.roomId === selectedRoomId) {
        setMessages((prev) => prev.map((msg) => (!msg.isRead ? { ...msg, isRead: true } : msg)));
      }
      loadRooms().catch(() => null);
    },
    [selectedRoomId]
  );

  useDirectMessagesRealtime(user?.id, null, handleRealtimeMessage, handleRealtimeRead); // ✅ Pass null (backward compat)

  const showConversation = Boolean(selectedUser);

  return (
    <div className="mx-auto flex h-[calc(100vh-49px)] w-full max-w-6xl overflow-hidden bg-ig-background text-ig-text md:h-screen md:border-x md:border-ig-border">
      {/* Room List */}
      <aside
        className={`${showConversation ? "hidden md:flex" : "flex"} w-full flex-col border-r border-ig-border md:w-[360px] md:min-w-[360px]`}
      >
        <div className="border-b border-ig-border px-4 py-4">
          <h1 className="text-xl font-bold">{user?.username || "Pesan"}</h1>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ig-secondary-text" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari"
              className="w-full rounded-xl bg-ig-elevated-bg py-2 pl-9 pr-8 text-sm outline-none placeholder:text-ig-secondary-text"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ig-secondary-text hover:text-ig-text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {search.trim().length >= 2 ? (
            <UserList
              users={searchResults}
              onSelect={openUser}
              emptyText="Tidak ada user yang cocok."
            />
          ) : isRoomsLoading ? (
            <MessagesPageSkeleton />
          ) : roomsError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
              <p className="text-sm text-ig-secondary-text">Gagal memuat pesan.</p>
              <button
                onClick={loadRooms}
                className="mt-3 text-sm font-semibold text-ig-primary hover:opacity-80"
              >
                Coba Lagi
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-ig-secondary-text">
              Belum ada percakapan. Cari user untuk mulai kirim pesan.
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => openRoom(room)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-ig-elevated-bg ${
                  selectedRoomId === room.id ? "bg-ig-elevated-bg" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={getAvatar(room.otherUser)}
                    alt={room.otherUser.username}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <p
                      className={`truncate text-sm ${room.unreadCount > 0 ? "font-bold" : "font-semibold"}`}
                    >
                      {room.otherUser.name}
                    </p>
                    {room.lastMessage && (
                      <span className="ml-2 flex-shrink-0 text-[10px] text-ig-secondary-text">
                        {formatDate(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 flex items-center gap-1 truncate text-xs ${
                      room.unreadCount > 0 ? "font-semibold text-ig-text" : "text-ig-secondary-text"
                    }`}
                  >
                    {room.lastMessage ? (
                      <>
                        {room.lastMessage.senderId === user?.id &&
                          (room.lastMessage.isRead ? (
                            <CheckCheck className="inline h-3 w-3 flex-shrink-0 text-blue-400" />
                          ) : (
                            <Check className="inline h-3 w-3 flex-shrink-0" />
                          ))}
                        <span>{room.lastMessage.text}</span>
                      </>
                    ) : (
                      <span className="italic">@#{room.otherUser.username}</span>
                    )}
                  </p>
                </div>
                {room.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ig-primary px-1.5 text-[11px] font-bold text-white">
                      {room.unreadCount > 9 ? "9+" : room.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <section
        className={`${showConversation ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-ig-border px-4 py-3">
              <button type="button" onClick={goBack} className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link
                to={`/profile/${selectedUser.username}`}
                className="flex items-center gap-3 min-w-0"
              >
                <img
                  src={getAvatar(selectedUser)}
                  alt={selectedUser.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{selectedUser.name}</p>
                  <p className="truncate text-xs text-ig-secondary-text">
                    @{selectedUser.username}
                  </p>
                </div>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center text-ig-secondary-text">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-ig-secondary-text">
                  <img
                    src={getAvatar(selectedUser)}
                    alt={selectedUser.username}
                    className="mb-4 h-20 w-20 rounded-full object-cover"
                  />
                  <p className="text-base font-semibold text-ig-text">@{selectedUser.username}</p>
                  <p className="mt-1 max-w-xs text-sm">
                    Mulai percakapan. Pesan pertama kamu akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((message, index) => {
                    const isMine = message.senderId === user?.id;
                    const isConsecutive =
                      index > 0 && messages[index - 1].senderId === message.senderId;
                    const showAvatar = !isMine && !isConsecutive;

                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar for other user */}
                        {!isMine ? (
                          <div className={`flex-shrink-0 ${showAvatar ? "" : "invisible"}`}>
                            <img
                              src={getAvatar(selectedUser)}
                              alt={selectedUser.username}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-7 flex-shrink-0" />
                        )}

                        {/* Bubble */}
                        <div
                          className={`flex max-w-[75%] flex-col ${isMine ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`px-3.5 py-2 text-sm leading-relaxed ${
                              isMine
                                ? "rounded-[22px] rounded-br-md bg-ig-primary text-white"
                                : "rounded-[22px] rounded-bl-md bg-ig-elevated-bg text-ig-text"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          </div>
                          {/* Timestamp + Read Status */}
                          {isMine && (
                            <div className="mt-0.5 flex items-center gap-1 px-1">
                              <span className="text-[10px] text-ig-secondary-text">
                                {formatTime(message.createdAt)}
                              </span>
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : (
                                <Check className="h-3 w-3 text-ig-secondary-text" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="border-t border-ig-border px-4 py-3"
            >
              <div className="flex items-end gap-2 rounded-3xl border border-ig-border bg-ig-background px-4 py-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={1}
                  placeholder={`Kirim pesan...`}
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-ig-secondary-text"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="flex-shrink-0 text-ig-primary transition hover:text-ig-primary-hover disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-ig-secondary-text">
            <div className="mb-4 rounded-full border border-ig-border p-5">
              <MessageCircle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-ig-text">Pesan Anda</h2>
            <p className="mt-2 max-w-sm text-sm">
              Pilih percakapan atau cari user untuk mulai ngobrol realtime.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function UserList({
  users,
  onSelect,
  emptyText,
}: {
  users: ChatUser[];
  onSelect: (user: ChatUser) => void;
  emptyText: string;
}) {
  if (users.length === 0) {
    return <div className="px-6 py-10 text-center text-sm text-ig-secondary-text">{emptyText}</div>;
  }

  return (
    <div className="py-2">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onSelect(user)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-ig-elevated-bg"
        >
          <img
            src={getAvatar(user)}
            alt={user.username}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-ig-secondary-text">@{user.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
