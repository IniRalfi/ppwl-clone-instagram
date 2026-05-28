import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ProfileImageEditorModalProps {
  imageFile: File;
  onClose: () => void;
  onSave: (editedFile: File) => void;
}

const filtersPreset = [
  { name: "Normal", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Vintage", value: "contrast(115%) sepia(35%) saturate(85%)" },
  { name: "Bright", value: "brightness(120%) contrast(95%)" },
  { name: "Warm", value: "sepia(20%) saturate(130%) hue-rotate(-10deg)" },
  { name: "Cool", value: "saturate(110%) hue-rotate(10deg) brightness(95%)" },
  { name: "Retro", value: "contrast(135%) brightness(110%) sepia(15%)" },
];

export default function ProfileImageEditorModal({
  imageFile,
  onClose,
  onSave,
}: ProfileImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [activeFilter, setActiveFilter] = useState("none");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedImage(img);
    };
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    renderCanvas();
  }, [loadedImage, activeFilter, scale, offset]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set filter
    ctx.filter = activeFilter;

    // Draw image centered and scaled
    const size = canvas.width;
    const imgWidth = loadedImage.width;
    const imgHeight = loadedImage.height;
    
    // Calculate aspect ratio fit
    const ratio = Math.max(size / imgWidth, size / imgHeight);
    const w = imgWidth * ratio * scale;
    const h = imgHeight * ratio * scale;

    const x = (size - w) / 2 + offset.x;
    const y = (size - h) / 2 + offset.y;

    ctx.drawImage(loadedImage, x, y, w, h);
    
    // Reset filter
    ctx.filter = "none";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], imageFile.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        onSave(editedFile);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-ig-secondary-bg border border-ig-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <button onClick={onClose} className="text-ig-text hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none">
            <X size={20} />
          </button>
          <span className="text-ig-text font-bold text-sm">Sesuaikan Foto Profil</span>
          <button onClick={handleApply} className="text-[#0095f6] hover:opacity-75 font-semibold text-sm cursor-pointer bg-transparent border-none">
            Selesai
          </button>
        </div>

        {/* Canvas Area */}
        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-full object-contain cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-full scale-[0.98]" />
        </div>

        {/* Slider Zoom */}
        <div className="px-6 py-4 border-b border-ig-border flex items-center gap-3">
          <ZoomOut size={16} className="text-ig-secondary-text" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-[#0095f6] h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
          />
          <ZoomIn size={16} className="text-ig-secondary-text" />
        </div>

        {/* Filters Preset List */}
        <div className="p-4 flex gap-4 overflow-x-auto select-none scrollbar-none">
          {filtersPreset.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFilter(f.value)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group bg-transparent border-none p-0"
            >
              <div
                className={`w-14 h-14 rounded-lg bg-neutral-900 overflow-hidden border-2 transition-all ${
                  activeFilter === f.value ? "border-[#0095f6]" : "border-transparent group-hover:border-neutral-700"
                }`}
              >
                {loadedImage && (
                  <img
                    src={loadedImage.src}
                    alt={f.name}
                    style={{ filter: f.value }}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className={`text-[11px] ${activeFilter === f.value ? "text-ig-text font-bold" : "text-ig-secondary-text"}`}>
                {f.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
