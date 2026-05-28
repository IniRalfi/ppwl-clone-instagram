import { useEffect, useRef, useState } from "react";
import { X, Type, Paintbrush, Sparkles, Undo2, Trash2, Palette, Check, Move } from "lucide-react";
import { toast } from "sonner";
import { uploadStory } from "../../services/story.service";

interface StoryEditorModalProps {
  imageFile: File;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  font: string;
  size: number;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  size: number;
}

const filtersPreset = [
  { name: "Normal", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Vintage", value: "contrast(115%) sepia(35%) saturate(85%)" },
  { name: "Bright", value: "brightness(125%) contrast(90%)" },
  { name: "Warm", value: "sepia(25%) saturate(130%) hue-rotate(-10deg)" },
  { name: "Cool", value: "saturate(110%) hue-rotate(10deg) brightness(95%)" },
  { name: "Retro", value: "contrast(140%) brightness(110%) sepia(15%)" },
];

const colorsList = [
  "#ffffff", // Putih
  "#000000", // Hitam
  "#ff3040", // Merah
  "#ffc300", // Kuning
  "#00f5d4", // Toska
  "#7638fa", // Ungu
  "#00b4d8", // Biru
];

const bgPresets = [
  { name: "Hitam", value: "#000000" },
  { name: "Abu-abu", value: "#1a1a1a" },
  { name: "Putih", value: "#ffffff" },
  { name: "Instagram", value: "gradient-insta" },
  { name: "Ungu", value: "#7638fa" },
  { name: "Kuning", value: "#ffc300" },
];

const fontsList = [
  { name: "Modern", value: "Outfit, sans-serif" },
  { name: "Classic", value: "'Playfair Display', serif" },
  { name: "Cursive", value: "'Dancing Script', cursive" },
  { name: "Typewriter", value: "'Courier Prime', monospace" },
  { name: "Heavy Retro", value: "'Rubik Mono One', sans-serif" },
];

export default function StoryEditorModal({
  imageFile,
  onClose,
  onUploadSuccess,
}: StoryEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // States untuk Tool Editor (Default ke "photo" agar pengguna bisa menyetel tata letak foto dulu)
  const [tool, setTool] = useState<"photo" | "filter" | "draw" | "text">("photo");
  const [activeFilter, setActiveFilter] = useState("none");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // States untuk Penyesuaian Foto (Pencegah auto-stretch & kustomisasi latar)
  const [imageScale, setImageScale] = useState(100); // 10% - 300%
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [bgColor, setBgColor] = useState("gradient-insta");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // States untuk Coretan (Drawing)
  const [brushColor, setBrushColor] = useState("#ff3040");
  const [brushSize, setBrushSize] = useState(8);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // States untuk Teks
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [fontColor, setFontColor] = useState("#ffffff");
  const [fontStyle, setFontStyle] = useState("Outfit, sans-serif");
  const [fontSize, setFontSize] = useState(36);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  // Load Image File ke Canvas
  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedImage(img);
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 120;
      tempCanvas.height = 120;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        const ratio = Math.min(120 / img.width, 120 / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        tempCtx.drawImage(img, (120 - w) / 2, (120 - h) / 2, w, h);
        setThumbnailUrl(tempCanvas.toDataURL("image/jpeg", 0.7));
      }
    };
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Render Canvas secara Dinamis jika ada State yang Berubah
  useEffect(() => {
    renderCanvas();
  }, [loadedImage, activeFilter, strokes, textItems, imageScale, imageX, imageY, bgColor]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset internal canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Latar Belakang (Solid atau Instagram Gradient)
    if (bgColor === "gradient-insta") {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#c32aa3"); // Instagram Ungu-Merah Muda
      grad.addColorStop(0.5, "#d62976");
      grad.addColorStop(1, "#f77737"); // Jingga
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Gambar Foto dengan Aspek Rasio Asli (Fit Contain) & Skala Kustom
    ctx.filter = activeFilter;
    const imgWidth = loadedImage.width;
    const imgHeight = loadedImage.height;

    // Hitung ukuran fit contain secara default
    const ratio = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
    const baseWidth = imgWidth * ratio;
    const baseHeight = imgHeight * ratio;

    // Terapkan skala kustom dari user
    const scale = imageScale / 100;
    const drawWidth = baseWidth * scale;
    const drawHeight = baseHeight * scale;

    // Hitung koordinat penempatan di tengah + offset manual dari user
    const centerX = (canvas.width - drawWidth) / 2 + imageX;
    const centerY = (canvas.height - drawHeight) / 2 + imageY;

    ctx.drawImage(loadedImage, centerX, centerY, drawWidth, drawHeight);
    ctx.filter = "none"; // Matikan filter agar teks/coretan tidak ikut terpengaruh

    // 3. Gambar Semua Coretan Kuas
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // 4. Gambar Semua Teks Overlay
    textItems.forEach((item) => {
      ctx.font = `${item.size}px ${item.font}`;
      ctx.fillStyle = item.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(item.text, item.x, item.y);

      // Reset Shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
  };

  // Dapatkan Posisi Koordinat Klik Relatif Terhadap Resolusi Canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  // Aksi Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (tool === "photo") {
      setIsDraggingPhoto(true);
      setDragStart({ x: x - imageX, y: y - imageY });
    } else if (tool === "draw") {
      setIsDrawing(true);
      const newStroke: Stroke = {
        points: [{ x, y }],
        color: brushColor,
        size: brushSize,
      };
      setStrokes((prev) => [...prev, newStroke]);
    } else if (tool === "text") {
      const clickedItem = [...textItems]
        .reverse()
        .find((item) => Math.hypot(item.x - x, item.y - y) < item.size * 2);

      if (clickedItem) {
        setSelectedTextId(clickedItem.id);
        setIsDraggingText(true);
        setInputText(clickedItem.text);
        setFontColor(clickedItem.color);
        setFontStyle(clickedItem.font);
        setFontSize(clickedItem.size);
      } else {
        setSelectedTextId(null);
      }
    }
  };

  // Aksi Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (tool === "photo" && isDraggingPhoto) {
      setImageX(x - dragStart.x);
      setImageY(y - dragStart.y);
    } else if (tool === "draw" && isDrawing) {
      setStrokes((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = { ...next[next.length - 1] };
        last.points = [...last.points, { x, y }];
        next[next.length - 1] = last;
        return next;
      });
    } else if (tool === "text" && isDraggingText && selectedTextId) {
      setTextItems((prev) =>
        prev.map((item) =>
          item.id === selectedTextId ? { ...item, x, y } : item
        )
      );
    }
  };

  // Aksi Mouse Up / Leave
  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
    setIsDraggingText(false);
    setIsDraggingPhoto(false);
  };

  // Reset Posisi & Skala Foto
  const handleResetPhoto = () => {
    setImageScale(100);
    setImageX(0);
    setImageY(0);
    setBgColor("gradient-insta");
  };

  // Tambahkan Teks Baru ke Canvas
  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (selectedTextId) {
      setTextItems((prev) =>
        prev.map((item) =>
          item.id === selectedTextId
            ? { ...item, text: inputText, color: fontColor, font: fontStyle, size: fontSize }
            : item
        )
      );
      setSelectedTextId(null);
    } else {
      const newItem: TextItem = {
        id: Math.random().toString(36).substring(2, 9),
        text: inputText,
        x: 360,
        y: 640,
        color: fontColor,
        font: fontStyle,
        size: fontSize,
      };
      setTextItems((prev) => [...prev, newItem]);
    }
    setInputText("");
  };

  // Hapus Teks Terpilih
  const handleDeleteText = () => {
    if (!selectedTextId) return;
    setTextItems((prev) => prev.filter((item) => item.id !== selectedTextId));
    setSelectedTextId(null);
    setInputText("");
  };

  // Undo Coretan Terakhir
  const handleUndoDraw = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // Mengunggah Hasil Canvas yang Sudah Diedit ke Server
  const handleUploadClick = () => {
    const canvas = canvasRef.current;
    if (!canvas || isUploading) return;

    setIsUploading(true);
    const toastId = toast.loading("Memproses dan mengunggah cerita Anda...");

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Gagal memproses gambar.", { id: toastId });
          setIsUploading(false);
          return;
        }

        const editedFile = new File([blob], "instafy_story.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        try {
          await uploadStory(editedFile);
          toast.success("Cerita berhasil diunggah! 🎉", { id: toastId });
          onUploadSuccess();
          onClose();
        } catch (error: any) {
          toast.error(error.message || "Gagal mengunggah cerita", { id: toastId });
        } finally {
          setIsUploading(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex flex-col md:flex-row items-center justify-center p-4 md:p-6 animate-in fade-in duration-200 select-none">
      {/* Load Google Fonts Secara Dinamis */}
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@1,700&family=Outfit:wght@800&family=Courier+Prime:wght@700&family=Rubik+Mono+One&display=swap"
        rel="stylesheet"
      />

      {/* Konten Kiri: Tampilan Kanvas Cerita */}
      <div className="flex-1 flex items-center justify-center max-h-[70vh] md:max-h-[85vh] w-full relative">
        <div className="relative aspect-[9/16] h-full max-h-[70vh] md:max-h-[85vh] rounded-2xl overflow-hidden border border-ig-border bg-neutral-900 shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={1280}
            className={`max-w-full max-h-full aspect-[9/16] object-contain ${
              tool === "photo"
                ? "cursor-move"
                : tool === "draw"
                ? "cursor-crosshair"
                : tool === "text"
                ? "cursor-move"
                : "cursor-default"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          />

          {/* Panduan Layar */}
          {tool === "photo" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1.5 rounded-full text-[11px] text-white/90 font-medium pointer-events-none backdrop-blur-xs border border-white/10 shadow-lg flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5" /> Seret foto di layar untuk menyesuaikan posisi
            </div>
          )}
        </div>
      </div>

      {/* Konten Kanan: Panel Kontrol Editor */}
      <div className="w-full md:w-[360px] bg-ig-secondary-bg border border-ig-border rounded-2xl p-5 flex flex-col justify-between h-auto md:h-[85vh] md:ml-6 mt-4 md:mt-0 shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="flex items-center justify-between border-b border-ig-border pb-3.5">
            <div>
              <h2 className="font-bold text-ig-text text-base">Instafy Story Editor</h2>
              <p className="text-xs text-ig-secondary-text">Kustomisasi ceritamu sebelum diunggah</p>
            </div>
            <button
              onClick={onClose}
              className="text-ig-text hover:text-ig-secondary-text p-1.5 rounded-full hover:bg-ig-elevated-bg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector Alat */}
          <div className="grid grid-cols-4 gap-1 bg-ig-elevated-bg/50 p-1 rounded-xl">
            <button
              onClick={() => {
                setTool("photo");
                setSelectedTextId(null);
              }}
              className={`flex items-center justify-center gap-1 py-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                tool === "photo"
                  ? "bg-ig-primary text-white shadow-md"
                  : "text-ig-secondary-text hover:text-white"
              }`}
            >
              Foto
            </button>
            <button
              onClick={() => {
                setTool("filter");
                setSelectedTextId(null);
              }}
              className={`flex items-center justify-center gap-1 py-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                tool === "filter"
                  ? "bg-ig-primary text-white shadow-md"
                  : "text-ig-secondary-text hover:text-white"
              }`}
            >
              Filter
            </button>
            <button
              onClick={() => {
                setTool("draw");
                setSelectedTextId(null);
              }}
              className={`flex items-center justify-center gap-1 py-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                tool === "draw"
                  ? "bg-ig-primary text-white shadow-md"
                  : "text-ig-secondary-text hover:text-white"
              }`}
            >
              Coret
            </button>
            <button
              onClick={() => setTool("text")}
              className={`flex items-center justify-center gap-1 py-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                tool === "text"
                  ? "bg-ig-primary text-white shadow-md"
                  : "text-ig-secondary-text hover:text-white"
              }`}
            >
              Teks
            </button>
          </div>

          {/* Detail Kontrol Berdasarkan Tool Aktif */}
          <div className="space-y-4 min-h-[220px]">
            {/* ── TOOL: PHOTO (PENYESUAIAN FOTO & LATAR) ── */}
            {tool === "photo" && (
              <div className="space-y-5">
                {/* Latar Belakang */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
                    Warna Latar Belakang
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {bgPresets.map((bg) => (
                      <button
                        key={bg.name}
                        onClick={() => setBgColor(bg.value)}
                        style={{
                          background:
                            bg.value === "gradient-insta"
                              ? "linear-gradient(135deg, #c32aa3, #d62976, #f77737)"
                              : bg.value,
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-neutral-700 transition-all ${
                          bgColor === bg.value
                            ? "ring-2 ring-ig-primary text-white ring-offset-2 ring-offset-ig-secondary-bg"
                            : "text-ig-text hover:brightness-110"
                        }`}
                      >
                        <span className={bgColor === bg.value ? "underline font-bold" : ""}>
                          {bg.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skala Foto */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ig-secondary-text">Skala Foto (Zoom)</span>
                    <span className="text-ig-text">{imageScale}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    value={imageScale}
                    onChange={(e) => setImageScale(Number(e.target.value))}
                    className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
                  />
                </div>

                {/* Posisi X */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ig-secondary-text">Posisi X (Geser Kiri/Kanan)</span>
                    <span className="text-ig-text">{imageX}px</span>
                  </div>
                  <input
                    type="range"
                    min={-600}
                    max={600}
                    value={imageX}
                    onChange={(e) => setImageX(Number(e.target.value))}
                    className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
                  />
                </div>

                {/* Posisi Y */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ig-secondary-text">Posisi Y (Geser Atas/Bawah)</span>
                    <span className="text-ig-text">{imageY}px</span>
                  </div>
                  <input
                    type="range"
                    min={-1000}
                    max={1000}
                    value={imageY}
                    onChange={(e) => setImageY(Number(e.target.value))}
                    className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
                  />
                </div>

                <button
                  onClick={handleResetPhoto}
                  className="w-full py-2.5 text-xs font-semibold rounded-xl bg-ig-elevated-bg hover:bg-neutral-800 text-ig-text transition-colors cursor-pointer border-none"
                >
                  Reset Layout Foto & Latar
                </button>
              </div>
            )}

            {/* ── TOOL: FILTER ── */}
            {tool === "filter" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider">
                  Pilih Filter
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {filtersPreset.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveFilter(f.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
                          className="w-16 h-16 object-cover rounded-lg mb-1.5 shadow-md border border-neutral-700"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-neutral-700 rounded-lg mb-1.5 animate-pulse" />
                      )}
                      <span className="text-[13px]">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TOOL: DRAW ── */}
            {tool === "draw" && (
              <div className="space-y-5">
                {/* Pilihan Ukuran Kuas */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ig-secondary-text">Ukuran Kuas</span>
                    <span className="text-ig-text">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
                  />
                </div>

                {/* Pilihan Warna Kuas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
                    Warna Kuas
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {colorsList.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                          brushColor === c
                            ? "ring-2 ring-offset-2 ring-offset-ig-secondary-bg ring-ig-primary scale-105"
                            : "border border-neutral-700"
                        }`}
                      >
                        {brushColor === c && (
                          <Check
                            className={`w-4 h-4 ${
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

                <div className="flex gap-2 pt-2 border-t border-ig-border/60">
                  <button
                    onClick={handleUndoDraw}
                    disabled={strokes.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl bg-ig-elevated-bg text-ig-text hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer border-none"
                  >
                    <Undo2 className="w-4 h-4" /> Batalkan Coretan ({strokes.length})
                  </button>
                </div>
              </div>
            )}

            {/* ── TOOL: TEKS ── */}
            {tool === "text" && (
              <form onSubmit={handleAddText} className="space-y-4">
                {/* Input Text Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
                    {selectedTextId ? "Edit Teks Terpilih" : "Masukkan Teks"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ketik sesuatu..."
                      className="flex-1 bg-ig-elevated-bg border border-ig-border rounded-xl px-3 py-2 text-sm text-ig-text placeholder-ig-secondary-text focus:outline-none focus:ring-1 focus:ring-ig-primary"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="bg-ig-primary hover:bg-blue-500 text-white font-semibold px-4 rounded-xl text-xs transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {selectedTextId ? "Terapkan" : "Tambah"}
                    </button>
                  </div>
                </div>

                {/* Gaya Font */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
                    Gaya Font
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {fontsList.map((f) => (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setFontStyle(f.value)}
                        className={`py-1.5 px-2.5 text-xs rounded-lg text-center transition-all cursor-pointer ${
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

                {/* Ukuran Font */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ig-secondary-text">Ukuran Font</span>
                    <span className="text-ig-text">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={72}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-ig-elevated-bg rounded-lg appearance-none cursor-pointer accent-ig-primary"
                  />
                </div>

                {/* Warna Font */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ig-secondary-text uppercase tracking-wider block">
                    Warna Teks
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {colorsList.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFontColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                          fontColor === c
                            ? "ring-2 ring-offset-2 ring-offset-ig-secondary-bg ring-ig-primary scale-105"
                            : "border border-neutral-700"
                        }`}
                      >
                        {fontColor === c && (
                          <Check
                            className={`w-4 h-4 ${
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

                {/* Hapus Teks Terpilih */}
                {selectedTextId && (
                  <button
                    type="button"
                    onClick={handleDeleteText}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Teks Terpilih
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer Panel */}
        <div className="flex gap-3 border-t border-ig-border pt-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold rounded-xl bg-ig-elevated-bg text-ig-text hover:bg-neutral-800 transition-colors cursor-pointer border-none"
          >
            Batal
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!loadedImage || isUploading}
            className="flex-1 py-3 text-sm font-semibold rounded-xl bg-ig-primary hover:bg-blue-500 text-white transition-colors disabled:opacity-50 cursor-pointer border-none flex items-center justify-center"
          >
            {isUploading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Unggah Cerita"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
