interface AspectRatio {
  name: string;
  width: number;
  height: number;
}

interface BgPreset {
  name: string;
  value: string;
}

interface LayoutTabProps {
  aspectRatios: AspectRatio[];
  activeRatioName: string;
  onRatioChange: (width: number, height: number, name: string) => void;
  bgPresets: BgPreset[];
  bgColor: string;
  onBgColorChange: (color: string) => void;
  imageScale: number;
  onScaleChange: (scale: number) => void;
  onReset: () => void;
}

export function LayoutTab({
  aspectRatios,
  activeRatioName,
  onRatioChange,
  bgPresets,
  bgColor,
  onBgColorChange,
  imageScale,
  onScaleChange,
  onReset,
}: LayoutTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
          Rasio Aspek Postingan
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.name}
              onClick={() => onRatioChange(ratio.width, ratio.height, ratio.name)}
              className={`py-2 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                activeRatioName === ratio.name
                  ? "bg-ig-primary text-white border-ig-primary"
                  : "bg-ig-elevated-bg border-ig-border text-ig-text hover:bg-neutral-800"
              }`}
            >
              {ratio.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
          Latar Belakang (Margin)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {bgPresets.map((bg) => (
            <button
              key={bg.name}
              onClick={() => onBgColorChange(bg.value)}
              style={{
                background:
                  bg.value === "gradient-insta"
                    ? "linear-gradient(135deg, #c32aa3, #d62976, #f77737)"
                    : bg.value,
              }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer border border-neutral-700 transition-all ${
                bgColor === bg.value
                  ? "ring-2 ring-ig-primary text-white"
                  : "text-ig-text"
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-ig-secondary-text">Skala Foto</span>
          <span className="text-ig-text">{imageScale}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={300}
          value={imageScale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
        />
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 text-xs font-semibold rounded-lg bg-ig-elevated-bg hover:bg-neutral-800 text-ig-text transition-colors cursor-pointer border-none"
      >
        Reset Layout Foto
      </button>
    </div>
  );
}
