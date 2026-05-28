import { useRef, useState } from "react";
import {
  Heart, MessageCircle, Bookmark, Send, Search, Home, Bell, User,
  MoreHorizontal, Check, X, Download, Plus,
} from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar } from "../components/common/Avatar";

const TX = "text-[#f5f5f5]";
const TX2 = "text-[#a8a8a8]";

const circle = "rounded-full bg-gradient-to-br from-yellow-300 to-orange-400";

function B({ t, c, children }: { t: string; c?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#1a1a1a] rounded-2xl border border-[rgba(255,255,255,0.12)] p-3 ${c || ""}`}>
      <div className={`${TX2} text-[9px] font-bold uppercase tracking-[0.08em] mb-2`}>{t}</div>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  const r = useRef<HTMLDivElement>(null);
  const [d, setD] = useState(false);

  const dl = async () => {
    if (!r.current) return;
    setD(true);
    try {
      const n = r.current;
      n.style.width = n.scrollWidth + "px";
      n.style.height = n.scrollHeight + "px";
      await new Promise(x => setTimeout(x, 200));
      const u = await toPng(n, { quality: 1, pixelRatio: 2, backgroundColor: "#0a0a0a", cacheBust: true });
      n.style.width = "";
      n.style.height = "";
      const a = document.createElement("a");
      a.download = "instafy-design-system.png";
      a.href = u;
      a.click();
    } catch (e) { console.error(e) } finally { setD(false) }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-4xl mx-auto mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/favicon/favicon.svg" alt="" className="w-7 h-7" />
          <span className={`${TX} font-bold text-sm`}>Instafy Design System</span>
        </div>
        <button onClick={dl} disabled={d}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-gray-200 cursor-pointer disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {d ? "..." : "Download PNG"}
        </button>
      </div>

      <div ref={r} className="max-w-4xl mx-auto space-y-2">

        {/* ROW 1: TYPOGRAPHY + WARNA */}
        <div className="grid grid-cols-4 gap-2">
          <B t="Tipografi" c="col-span-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#262626] rounded-lg px-2.5 py-2">
                <p className={`${TX2} text-[8px]`}>H1 24px Bold</p>
                <p className={`${TX} text-lg font-bold`}>Instafy</p>
              </div>
              <div className="bg-[#262626] rounded-lg px-2.5 py-2">
                <p className={`${TX2} text-[8px]`}>H2 20px Semibold</p>
                <p className={`${TX} text-base font-semibold`}>Cerita Hari Ini</p>
              </div>
              <div className="bg-[#262626] rounded-lg px-2.5 py-2">
                <p className={`${TX2} text-[8px]`}>H3 16px Semibold</p>
                <p className={`${TX} text-sm font-semibold`}>Highlights</p>
              </div>
              <div className="bg-[#262626] rounded-lg px-2.5 py-2">
                <p className={`${TX2} text-[8px]`}>Body 14px</p>
                <p className={`${TX} text-xs`}>Momen indah <span className="text-[#0095f6]">#sunset</span></p>
              </div>
              <div className="bg-[#262626] rounded-lg px-2.5 py-2">
                <p className={`${TX2} text-[8px]`}>Secondary 13px</p>
                <p className={`${TX2} text-xs`}>2 jam lalu • 1.234x</p>
              </div>
              <div className="bg-[#262626] rounded-lg px-2.5 py-2">
                <p className={`${TX2} text-[8px]`}>Caption 11px</p>
                <p className={`${TX2} text-[10px] uppercase font-medium tracking-wide`}>Lihat 24 komentar</p>
              </div>
            </div>
          </B>
          <B t="Warna" c="col-span-1">
            <div className="grid grid-cols-3 gap-1">
              {[
                ["#0095f6","Prim"], ["#ed4956","Like"], ["#3797f0","Chat"],
                ["#FFD600","Ylw"], ["#FF0069","Pnk"], ["#7638FA","Purp"],
              ].map(([c, n]) => (
                <div key={n} className="flex flex-col items-center">
                  <div className="w-full aspect-square rounded" style={{ background: c }} />
                  <span className="text-[7px] text-[#a8a8a8]">{n}</span>
                </div>
              ))}
            </div>
          </B>
        </div>

        {/* ROW 2: BUTTONS + AVATAR + INPUT */}
        <div className="grid grid-cols-4 gap-2">
          <B t="Buttons" c="col-span-2">
            <div className="flex flex-wrap gap-1 mb-1.5">
              {(["default","secondary","destructive","outline","ghost","link"] as const).map((v,i) =>
                <Button key={v} size="sm" variant={v}>{["Def","Sec","Hps","Btl","Gst","Lnk"][i]}</Button>
              )}
              <Button size="sm" disabled>Dis</Button>
            </div>
            <div className="flex gap-1.5">
              <button className="flex-1 py-1.5 rounded-lg bg-[#0095f6] text-white font-semibold text-xs cursor-pointer">Masuk</button>
              <button className="flex-1 py-1.5 rounded-lg bg-transparent text-[#0095f6] font-semibold text-xs border border-[rgba(255,255,255,0.12)] cursor-pointer">Daftar</button>
            </div>
          </B>
          <B t="Avatar">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center"><Avatar name="A" size="sm" /><span className={`${TX2} text-[7px]`}>sm</span></div>
              <div className="flex flex-col items-center"><Avatar name="R" size="md" /><span className={`${TX2} text-[7px]`}>md</span></div>
              <div className="flex flex-col items-center"><Avatar name="O" size="lg" /><span className={`${TX2} text-[7px]`}>lg</span></div>
            </div>
          </B>
          <B t="Input">
            <div className="space-y-1.5">
              <Input placeholder="Caption..." className="bg-[#262626] border-[rgba(255,255,255,0.12)] text-[#f5f5f5] placeholder:text-[#a8a8a8] h-7 text-xs" />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#a8a8a8]" />
                <Input placeholder="Cari..." className="bg-[#262626] border-[rgba(255,255,255,0.12)] text-[#f5f5f5] placeholder:text-[#a8a8a8] pl-7 h-7 text-xs" />
              </div>
            </div>
          </B>
        </div>

        {/* ROW 3: BADGE + STORIES + CHAT */}
        <div className="grid grid-cols-4 gap-2">
          <B t="Badge & Toast">
            <div className="flex gap-3 mb-2">
              <div className="relative"><Bell className="w-5 h-5 text-[#a8a8a8]" strokeWidth={1.5} /><span className="absolute -right-1.5 -top-1.5 min-w-[14px] h-3.5 rounded-full bg-[#ed4956] text-white text-[8px] font-bold flex items-center justify-center px-[3px]">3</span></div>
              <div className="relative"><MessageCircle className="w-5 h-5 text-[#a8a8a8]" strokeWidth={1.5} /><span className="absolute -right-1.5 -top-1.5 min-w-[14px] h-3.5 rounded-full bg-[#0095f6] text-white text-[8px] font-bold flex items-center justify-center px-[3px]">9+</span></div>
            </div>
            <div className="bg-[#262626] rounded-lg border border-[rgba(255,255,255,0.12)] px-2.5 py-1.5">
              <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#d62976] mt-0.5" /><div><p className={`${TX} text-[11px] font-semibold`}>Berhasil!</p><p className={`${TX2} text-[9px]`}>Postingan terunggah.</p></div></div>
            </div>
          </B>
          <B t="Stories">
            <div className="flex gap-1.5">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative"><div className="rounded-full bg-[rgba(255,255,255,0.12)] p-[1px]"><div className="rounded-full p-[1.5px] bg-[#0a0a0a]"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-300 to-pink-300" /></div></div><div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#0095f6] border-2 border-[#0a0a0a] flex items-center justify-center"><Plus className="w-1.5 h-1.5 text-white" strokeWidth={3} /></div></div>
                <span className={`${TX2} text-[7px]`}>Kamu</span>
              </div>
              {[
                ["adella", true, "bg-gradient-to-br from-yellow-300 to-orange-400"],
                ["yasmin", true, "bg-gradient-to-br from-green-300 to-blue-400"],
                ["bagas", false, "bg-gradient-to-br from-gray-400 to-gray-500"],
                ["olivia", true, "bg-gradient-to-br from-pink-300 to-purple-400"],
              ].map(([name, unread, bg]) => (
                <div key={name as string} className="flex flex-col items-center flex-shrink-0">
                  <div className={`rounded-full ${unread ? "bg-gradient-to-tr from-[#FFD600] via-[#FF0069] to-[#7638FA] p-[2px]" : "bg-[rgba(255,255,255,0.12)] p-[1px]"}`}>
                    <div className="rounded-full p-[1.5px] bg-[#0a0a0a]"><div className={`w-10 h-10 rounded-full ${bg as string}`} /></div></div>
                  <span className={`${TX2} text-[7px]`}>{name as string}</span>
                </div>
              ))}
            </div>
          </B>
          <B t="Chat" c="col-span-2">
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex-shrink-0 mt-0.5" />
                <div className="max-w-[70%] bg-[#262626] text-[#f5f5f5] text-xs rounded-xl rounded-tl-sm px-3 py-1.5">
                  <p className="text-[#a8a8a8] text-[8px] font-semibold">adella_n</p>
                  Cerita stories kamu keren! 🔥
                </div>
              </div>
              <div className="flex items-start gap-1.5 justify-end">
                <div className="max-w-[70%] bg-[#3797f0] text-white text-xs rounded-xl rounded-tr-sm px-3 py-1.5">Makasih Adel! Senang denger kamu suka~</div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 mt-0.5" />
              </div>
              <p className={`${TX2} text-[8px] text-center`}>10.30 PM — Terbaca</p>
            </div>
          </B>
        </div>

        {/* ROW 4: NAV + CARD + IKON + SKELETON */}
        <div className="grid grid-cols-4 gap-2">
          <B t="Nav">
            <div className="border border-[rgba(255,255,255,0.12)] rounded-lg p-1 flex items-center justify-around">
              {[Home, Search, PlusSquareIcon, Bell, User].map((Icon, i) => (
                <Icon key={i} className={`w-4 h-4 ${i === 0 ? "text-[#f5f5f5]" : "text-[#a8a8a8]"}`} strokeWidth={i === 0 ? 2.5 : 1.5} />
              ))}
            </div>
          </B>
          <B t="Sidebar">
            <div className="flex gap-1">
              {[
                [Home, "Beranda", true], [Search, "Cari"], [Heart, "Notif"], [User, "Profil"],
              ].map(([Icon, label, active]) => {
                const I = Icon as React.FC<{ className?: string; strokeWidth?: number }>;
                return (
                  <div key={label as string} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${active ? "bg-[#262626] text-[#f5f5f5]" : TX2}`}>
                    <I className="w-3 h-3" strokeWidth={active ? 2.2 : 1.5} />
                    {label as string}
                  </div>
                );
              })}
            </div>
          </B>
          <B t="Info">
            <div className="space-y-1 text-[11px]">
              {[["Postingan","24"],["Pengikut","1.2K"],["Mengikuti","189"]].map(([l,v]) => (
                <div key={l} className="flex justify-between py-0.5 border-b border-[rgba(255,255,255,0.06)] last:border-0">
                  <span className={TX2}>{l}</span><span className={`${TX} font-semibold`}>{v}</span>
                </div>
              ))}
            </div>
          </B>
          <B t="Ikon">
            <div className="flex flex-wrap gap-1">
              {[Heart, MessageCircle, Bookmark, Send, Search, Plus, Bell, User, MoreHorizontal].map((Icon, i) => (
                <div key={i} className="bg-[#262626] w-6 h-6 rounded flex items-center justify-center">
                  <Icon className="w-3 h-3 text-[#f5f5f5]" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </B>
        </div>

        {/* ROW 5: SKELETON + POST CARD SISI */}
        <div className="grid grid-cols-4 gap-2">
          <B t="Loading">
            <div className="animate-pulse space-y-1.5">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#262626]" /><div className="space-y-1 flex-1"><div className="h-2 w-16 bg-[#262626] rounded" /><div className="h-1.5 w-10 bg-[#262626] rounded" /></div></div>
              <div className="h-10 w-full bg-[#262626] rounded" />
            </div>
          </B>
          <B t="Post Card" c="col-span-3">
            <div className="flex gap-3">
              <div className="w-[140px] flex-shrink-0">
                <div className="aspect-[4/5] bg-black rounded-lg overflow-hidden border border-[rgba(255,255,255,0.12)]">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><Avatar name="R" size="sm" /><span className={`${TX} text-[11px] font-semibold`}>rafli_dev</span><span className={`${TX2} text-[9px]`}>• 2 jam</span></div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-[#f5f5f5]" />
                </div>
                <div className="flex items-center gap-2">
                  {[Heart, MessageCircle, Send].map((Icon, i) => <Icon key={i} className="w-4 h-4 text-[#f5f5f5]" strokeWidth={1.5} />)}
                  <Bookmark className="w-4 h-4 text-[#f5f5f5] ml-auto" strokeWidth={1.5} />
                </div>
                <p className={`${TX} text-[11px] font-bold`}>1.234 suka</p>
                <p className="text-[11px]"><span className={`${TX} font-semibold`}>rafli_dev</span> <span className={TX2}>Sunset{" "}</span><span className="text-[#0095f6]">#sunset</span></p>
                <p className={`${TX2} text-[10px]`}>Lihat semua 24 komentar</p>
                <div className="flex items-center gap-1.5 pt-1 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-300 to-purple-300" />
                  <span className={`${TX2} text-[10px]`}>Tulis komentar...</span>
                  <span className="text-[#0095f6] text-[9px] font-semibold ml-auto">Kirim</span>
                </div>
              </div>
            </div>
          </B>
        </div>

      </div>
    </div>
  );
}

function PlusSquareIcon(p: { className?: string; strokeWidth?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth || 1.5} className={p.className}>
      <rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
