import { Check } from "lucide-react";

interface FontItem {
  name: string;
  value: string;
}

interface TextTabProps {
  inputText: string;
  onInputTextChange: (value: string) => void;
  onAddText: (e: React.FormEvent) => void;
  selectedTextId: string | null;
  onDeleteText: () => void;
  fontStyle: string;
  onFontStyleChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  fontColor: string;
  onFontColorChange: (value: string) => void;
  fontsList: FontItem[];
  colorsList: string[];
}

export function TextTab({
  inputText,
  onInputTextChange,
  onAddText,
  selectedTextId,
  onDeleteText,
  fontStyle,
  onFontStyleChange,
  fontSize,
  onFontSizeChange,
  fontColor,
  onFontColorChange,
  fontsList,
  colorsList,
}: TextTabProps) {
  return (
    <form onSubmit={onAddText} className="space-y-2.5 md:space-y-3">
      <div className="space-y-1 md:space-y-1.5">
        <label className="text-[10px] md:text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
          {selectedTextId ? "Edit Teks" : "Tambah Teks"}
        </label>
        <div className="flex gap-1 md:gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            placeholder="Teks..."
            className="flex-1 bg-ig-elevated-bg border border-ig-border rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-xs text-ig-text placeholder-ig-secondary-text focus:outline-none focus:ring-1 focus:ring-ig-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-ig-primary hover:bg-blue-500 text-white font-semibold px-2.5 md:px-3 rounded-lg text-[10px] md:text-xs disabled:opacity-40 cursor-pointer"
          >
            {selectedTextId ? "Set" : "Ok"}
          </button>
        </div>
      </div>

      <div className="space-y-1 md:space-y-1.5">
        <span className="text-[10px] md:text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
          Font
        </span>
        <div className="grid grid-cols-2 gap-0.5 md:gap-1">
          {fontsList.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => onFontStyleChange(f.value)}
              className={`py-0.5 md:py-1 px-1 md:px-1.5 text-[9px] md:text-[10px] rounded-md text-center transition-all cursor-pointer ${
                fontStyle === f.value
                  ? "bg-ig-primary text-white font-bold"
                  : "bg-ig-elevated-bg border border-ig-border text-ig-text hover:bg-neutral-800"
              }`}
              style={{ fontFamily: f.value }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-0.5 md:space-y-1">
        <div className="flex justify-between text-[10px] md:text-xs font-semibold">
          <span className="text-ig-secondary-text">Ukuran</span>
          <span className="text-ig-text">{fontSize}px</span>
        </div>
        <input
          type="range"
          min={14}
          max={60}
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="w-full h-1 md:h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
        />
      </div>

      <div className="space-y-1 md:space-y-1.5">
        <span className="text-[10px] md:text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
          Warna
        </span>
        <div className="flex flex-wrap gap-1 md:gap-1.5">
          {colorsList.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onFontColorChange(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 md:w-6 md:h-6 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${
                fontColor === c
                  ? "ring-2 ring-offset-2 ring-offset-ig-secondary-bg ring-ig-primary scale-105"
                  : "border border-neutral-700"
              }`}
            >
              {fontColor === c && (
                <Check
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 ${
                    c === "#ffffff" || c === "#ffc300" || c === "#00f5d4"
                      ? "text-black"
                      : "text-white"
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedTextId && (
        <button
          type="button"
          onClick={onDeleteText}
          className="w-full py-1 md:py-1.5 text-[10px] md:text-xs font-semibold rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-500 transition-colors cursor-pointer border border-red-500/20"
        >
          Hapus Teks
        </button>
      )}
    </form>
  );
}
