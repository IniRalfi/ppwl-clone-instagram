interface FilterPreset {
  name: string;
  value: string;
}

interface FilterTabProps {
  filtersPreset: FilterPreset[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  thumbnailUrl: string | null;
}

export function FilterTab({
  filtersPreset,
  activeFilter,
  onFilterChange,
  thumbnailUrl,
}: FilterTabProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
        Pilih Filter Foto
      </span>
      <div className="grid grid-cols-3 gap-2">
        {filtersPreset.map((f) => (
          <button
            key={f.name}
            onClick={() => onFilterChange(f.value)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
              activeFilter === f.value
                ? "bg-ig-primary/10 border-ig-primary text-ig-primary font-semibold"
                : "bg-ig-elevated-bg border-ig-border text-ig-text hover:bg-neutral-800"
            }`}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={f.name}
                style={{ filter: f.value }}
                className="w-12 h-12 object-cover rounded-md mb-1 shadow-md border border-neutral-700"
              />
            ) : (
              <div className="w-12 h-12 bg-neutral-700 rounded-md mb-1 animate-pulse" />
            )}
            <span className="text-[10px]">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
