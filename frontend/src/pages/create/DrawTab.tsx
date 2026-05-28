import { Undo2, Check } from "lucide-react";

interface DrawTabProps {
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  colorsList: string[];
  onUndo: () => void;
  strokeCount: number;
}

export function DrawTab({
  brushColor,
  onBrushColorChange,
  brushSize,
  onBrushSizeChange,
  colorsList,
  onUndo,
  strokeCount,
}: DrawTabProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-ig-secondary-text">Ukuran Kuas</span>
          <span className="text-ig-text">{brushSize}px</span>
        </div>
        <input
          type="range"
          min={2}
          max={30}
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
          Warna Kuas
        </span>
        <div className="flex flex-wrap gap-1.5">
          {colorsList.map((c) => (
            <button
              key={c}
              onClick={() => onBrushColorChange(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${
                brushColor === c
                  ? "ring-2 ring-offset-2 ring-offset-ig-secondary-bg ring-ig-primary scale-105"
                  : "border border-neutral-700"
              }`}
            >
              {brushColor === c && (
                <Check
                  className={`w-3.5 h-3.5 ${
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

      <button
        onClick={onUndo}
        disabled={strokeCount === 0}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg bg-ig-elevated-bg text-ig-text hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer border-none"
      >
        <Undo2 className="w-3.5 h-3.5" /> Batal Coret ({strokeCount})
      </button>
    </div>
  );
}
