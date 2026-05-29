import { type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EditorToolPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRemoveImage: () => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  children: ReactNode;
}

export function EditorToolPanel({
  activeTab,
  onTabChange,
  onRemoveImage,
  isPanelOpen,
  onTogglePanel,
  children,
}: EditorToolPanelProps) {
  return (
    <div className="w-full md:w-[350px] bg-ig-secondary-bg border-t md:border-t-0 md:border-l border-ig-border flex flex-col overflow-hidden">
      {/* Mobile: Toggle Button */}
      <button
        onClick={onTogglePanel}
        className="md:hidden flex items-center justify-between px-4 py-3 bg-ig-elevated-bg/50 border-b border-ig-border cursor-pointer"
      >
        <span className="text-sm font-semibold">Alat Editor</span>
        {isPanelOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      {/* Panel Content */}
      <div
        className={`flex-1 p-4 flex flex-col justify-between overflow-y-auto transition-all duration-300 ${
          isPanelOpen ? "max-h-[45vh]" : "max-h-0 md:max-h-[calc(100vh-44px)]"
        } md:max-h-[calc(100vh-44px)]`}
      >
        <div className="space-y-4 md:space-y-5">
          {/* Tool Tabs - Horizontal scroll di mobile */}
          <div className="flex md:grid md:grid-cols-4 gap-1 bg-ig-elevated-bg/50 p-1 rounded-xl overflow-x-auto scrollbar-hide">
            {["photo", "filter", "draw", "text"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  onTabChange(t);
                }}
                className={`py-1.5 px-3 md:px-0 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === t
                    ? "bg-ig-primary text-white shadow-sm"
                    : "text-ig-secondary-text hover:text-white"
                }`}
              >
                {t === "photo" ? "Layout" : t === "draw" ? "Coret" : t}
              </button>
            ))}
          </div>

          <div className="space-y-3 md:space-y-4 min-h-[120px] md:min-h-[200px]">{children}</div>
        </div>

        <button
          onClick={onRemoveImage}
          className="mt-3 w-full py-2 md:py-2.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer border border-red-500/20"
        >
          Hapus Gambar & Batalkan
        </button>
      </div>
    </div>
  );
}
