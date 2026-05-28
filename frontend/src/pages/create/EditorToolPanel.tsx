import { type ReactNode } from "react";

interface EditorToolPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRemoveImage: () => void;
  children: ReactNode;
}

export function EditorToolPanel({
  activeTab,
  onTabChange,
  onRemoveImage,
  children,
}: EditorToolPanelProps) {
  return (
    <div className="w-full md:w-[350px] bg-ig-secondary-bg border-t md:border-t-0 md:border-l border-ig-border p-4 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-[calc(100vh-44px)]">
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-1 bg-ig-elevated-bg/50 p-1 rounded-xl">
          {["photo", "filter", "draw", "text"].map((t) => (
            <button
              key={t}
              onClick={() => {
                onTabChange(t);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                activeTab === t
                  ? "bg-ig-primary text-white shadow-sm"
                  : "text-ig-secondary-text hover:text-white"
              }`}
            >
              {t === "photo" ? "Layout" : t === "draw" ? "Coret" : t}
            </button>
          ))}
        </div>

        <div className="space-y-4 min-h-[200px]">{children}</div>
      </div>

      <button
        onClick={onRemoveImage}
        className="mt-4 w-full py-2.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer border border-red-500/20"
      >
        Hapus Gambar & Batalkan
      </button>
    </div>
  );
}
