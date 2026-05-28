// frontend/src/pages/DirectPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Image, Heart, Info, Phone, Video } from "lucide-react";
import { dummyChatRooms, dummyMessages, ChatMessage } from "../lib/mockData";

export default function DirectPage() {
  const [activeRoom, setActiveRoom] = useState(dummyChatRooms[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(dummyMessages);
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan paling baru setiap ada pesan masuk/dikirim
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: "user-current", // ID kita sebagai pengirim aktif
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen w-full bg-[#0c1014] text-[#f5f5f5] overflow-hidden">
      
      {/* ================= KOLOM KIRI: DAFTAR CHAT ================= */}
      <div className="w-full md:w-[350px] lg:w-[400px] border-r border-neutral-800 flex flex-col bg-[#191d22] md:bg-transparent shrink-0">
        {/* Header List Chat */}
        <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-5 font-bold text-xl">
          <span>{activeRoom.username}</span>
          <span className="text-sm font-normal text-blue-500 cursor-pointer hover:text-blue-400">
            Pesan Baru
          </span>
        </div>

        {/* List Room */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/30">
          <div className="px-5 py-3 text-sm font-semibold text-neutral-400">Pesan</div>
          {dummyChatRooms.map((room) => {
            const isActive = room.id === activeRoom.id;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors duration-200 ${
                  isActive ? "bg-[#25292e]" : "hover:bg-[#25292e]/50"
                }`}
              >
                <img
                  src={room.avatarUrl || "https://via.placeholder.com/150"}
                  alt={room.name}
                  className="w-14 h-14 rounded-full object-cover border border-neutral-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{room.name}</p>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {room.id === activeRoom.id && messages.length > 0 
                      ? messages[messages.length - 1].text 
                      : room.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-neutral-500 whitespace-nowrap self-start mt-1">
                  {room.lastMessageTime}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= KOLOM KANAN: RUANG OBROLAN ================= */}
      <div className="hidden md:flex flex-1 flex-col bg-[#0c1014]">
        {/* Header Chat Room */}
        <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={activeRoom.avatarUrl || "https://via.placeholder.com/150"}
              alt={activeRoom.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-sm leading-tight">{activeRoom.name}</h4>
              <span className="text-xs text-neutral-400">@{activeRoom.username}</span>
            </div>
          </div>
          
          {/* Action Icons */}
          <div className="flex items-center gap-4 text-neutral-300">
            <Phone className="w-5 h-5 cursor-pointer hover:text-white transition" />
            <Video className="w-6 h-6 cursor-pointer hover:text-white transition" />
            <Info className="w-5 h-5 cursor-pointer hover:text-white transition" />
          </div>
        </div>

        {/* Area Pesan / Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === "user-current";
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[65%] rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words ${
                    isMe
                      ? "bg-[#0095f6] text-white rounded-br-none"
                      : "bg-[#262626] text-[#f5f5f5] rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Pesan Area */}
        <div className="p-4 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 border border-neutral-800 rounded-full px-4 py-2.5 bg-[#191d22]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Kirim pesan..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-neutral-500"
            />
            {inputText.trim() ? (
              <button
                type="submit"
                className="text-[#0095f6] font-semibold text-sm hover:text-blue-400 transition pr-1"
              >
                Kirim
              </button>
            ) : (
              <div className="flex items-center gap-3 text-neutral-400">
                <Image className="w-5 h-5 cursor-pointer hover:text-white transition" />
                <Heart className="w-5 h-5 cursor-pointer hover:text-white transition" />
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}