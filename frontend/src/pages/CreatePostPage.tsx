import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { createPost } from "../services/post.service";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Move } from "lucide-react";
import { compressImage } from "../lib/image";
import { UploadStep } from "./create/UploadStep";
import { EditorToolPanel } from "./create/EditorToolPanel";
import { LayoutTab } from "./create/LayoutTab";
import { FilterTab } from "./create/FilterTab";
import { DrawTab } from "./create/DrawTab";
import { TextTab } from "./create/TextTab";
import { CaptionStep } from "./create/CaptionStep";

/** Ukuran maksimal file yang diizinkan (sesuai backend: 5 MB) */
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Step = "upload" | "editor" | "caption";

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

const aspectRatios = [
  { name: "1:1 Square", width: 800, height: 800 },
  { name: "4:5 Portrait", width: 800, height: 1000 },
  { name: "16:9 Landscape", width: 1080, height: 608 },
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>("upload");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editedFile, setEditedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── States untuk Editor Kanvas Postingan ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Dimensi Kanvas (Dapat diubah berdasarkan Rasio Aspek)
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [activeRatioName, setActiveRatioName] = useState("1:1 Square");

  // Kontrol Alat Editor
  const [tool, setTool] = useState<"photo" | "filter" | "draw" | "text">("photo");
  const [activeFilter, setActiveFilter] = useState("none");

  // Penyesuaian Foto
  const [imageScale, setImageScale] = useState(100);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [bgColor, setBgColor] = useState("#000000");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Coretan Kuas
  const [brushColor, setBrushColor] = useState("#ff3040");
  const [brushSize, setBrushSize] = useState(8);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Overlay Teks
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [fontColor, setFontColor] = useState("#ffffff");
  const [fontStyle, setFontStyle] = useState("Outfit, sans-serif");
  const [fontSize, setFontSize] = useState(32);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);

  // Mobile: Collapsible Tool Panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Load Image ke memory
  useEffect(() => {
    if (!imageFile) {
      setLoadedImage(null);
      setThumbnailUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedImage(img);

      // Buat miniatur thumbnail cepat untuk pratinjau filter
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

  // Render Kanvas Editor
  useEffect(() => {
    renderCanvas();
  }, [
    loadedImage,
    activeFilter,
    strokes,
    textItems,
    imageScale,
    imageX,
    imageY,
    bgColor,
    canvasWidth,
    canvasHeight,
  ]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Latar Belakang
    if (bgColor === "gradient-insta") {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#c32aa3");
      grad.addColorStop(0.5, "#d62976");
      grad.addColorStop(1, "#f77737");
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Gambar Foto Fit Contain + Skala + Geser
    ctx.filter = activeFilter;
    const imgWidth = loadedImage.width;
    const imgHeight = loadedImage.height;

    const ratio = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
    const baseWidth = imgWidth * ratio;
    const baseHeight = imgHeight * ratio;

    const scale = imageScale / 100;
    const drawWidth = baseWidth * scale;
    const drawHeight = baseHeight * scale;

    const centerX = (canvas.width - drawWidth) / 2 + imageX;
    const centerY = (canvas.height - drawHeight) / 2 + imageY;

    ctx.drawImage(loadedImage, centerX, centerY, drawWidth, drawHeight);
    ctx.filter = "none";

    // 3. Gambar Semua Coretan
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

    // 4. Gambar Semua Teks
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

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

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
        prev.map((item) => (item.id === selectedTextId ? { ...item, x, y } : item))
      );
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
    setIsDraggingText(false);
    setIsDraggingPhoto(false);
  };

  // ── Touch Event Handlers untuk Mobile ──
  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling saat drawing
    const { x, y } = getTouchCoords(e);

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

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling saat drawing
    const { x, y } = getTouchCoords(e);

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
        prev.map((item) => (item.id === selectedTextId ? { ...item, x, y } : item))
      );
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    setIsDraggingText(false);
    setIsDraggingPhoto(false);
  };

  const handleResetPhoto = () => {
    setImageScale(100);
    setImageX(0);
    setImageY(0);
    setBgColor("#000000");
  };

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
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        color: fontColor,
        font: fontStyle,
        size: fontSize,
      };
      setTextItems((prev) => [...prev, newItem]);
    }
    setInputText("");
  };

  const handleDeleteText = () => {
    if (!selectedTextId) return;
    setTextItems((prev) => prev.filter((item) => item.id !== selectedTextId));
    setSelectedTextId(null);
    setInputText("");
  };

  const handleUndoDraw = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // ── Validasi dan proses file yang dipilih ──
  const processFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Ukuran gambar maksimal ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    try {
      const optimizedFile = await compressImage(file);
      setImageFile(optimizedFile);
    } catch (err) {
      console.warn("⚠️ Gagal mengompres gambar, menggunakan file asli:", err);
      setImageFile(file);
    }
    setStep("editor");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setEditedFile(null);
    setImagePreview(null);
    setStrokes([]);
    setTextItems([]);
    setActiveFilter("none");
    handleResetPhoto();
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Ekspor Canvas Editor ke File JPEG
  const handleEditorNext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Gagal mengolah gambar hasil edit.");
          return;
        }
        const file = new File([blob], "instafy_post.jpg", { type: "image/jpeg" });
        setEditedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setStep("caption");
      },
      "image/jpeg",
      0.9
    );
  };

  // ── Submit form ──
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Kamu harus login terlebih dahulu.");
      return;
    }
    if (!caption.trim() && !editedFile) {
      toast.error("Tambahkan caption atau gambar terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      await createPost({
        userId: user.id,
        content: caption.trim(),
        image: editedFile ?? undefined,
      });
      toast.success("Postingan berhasil dibagikan! 🎉");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat postingan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex flex-col select-none">
      {/* Load Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@1,700&family=Outfit:wght@800&family=Courier+Prime:wght@700&family=Rubik+Mono+One&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-11 border-b border-ig-border bg-ig-background">
        <button
          onClick={
            step === "caption"
              ? () => setStep("editor")
              : step === "editor"
                ? handleRemoveImage
                : () => navigate(-1)
          }
          className="p-1 rounded-full hover:bg-ig-secondary-bg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold">
          {step === "upload"
            ? "Buat postingan baru"
            : step === "editor"
              ? "Edit Foto Postingan"
              : "Tulis Caption"}
        </h1>
        {step === "editor" ? (
          <button
            onClick={handleEditorNext}
            className="text-sm font-semibold text-ig-primary hover:text-blue-300 transition-colors cursor-pointer"
          >
            Lanjut
          </button>
        ) : step === "caption" ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!caption.trim() && !editedFile)}
            className="text-sm font-semibold text-ig-primary hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bagikan"}
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      {/* ── Main Content ── */}
      {step === "upload" ? (
        <UploadStep
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          fileInputRef={fileInputRef}
          isLoading={isLoading}
        />
      ) : step === "editor" ? (
        /* ── Step 2: Canvas Photo Editor (Reuses story editor layout) ── */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Panel Kiri: Kanvas Postingan */}
          <div className="flex-1 flex items-center justify-center bg-black/90 p-2 md:p-4 relative min-h-[60vh] md:min-h-[500px]">
            <div
              style={{
                width: "100%",
                maxWidth:
                  canvasWidth >= canvasHeight ? "500px" : `${(canvasWidth / canvasHeight) * 500}px`,
                aspectRatio: `${canvasWidth}/${canvasHeight}`,
              }}
              className="relative max-h-[65vh] md:max-h-[75vh] rounded-xl overflow-hidden border border-ig-border bg-neutral-900 shadow-2xl flex items-center justify-center"
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className={`max-w-full max-h-full object-contain touch-none ${
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              />
              {tool === "photo" && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/85 px-3 py-1.5 rounded-full text-[10px] text-white/95 font-medium pointer-events-none border border-white/10 shadow-lg flex items-center gap-1">
                  <Move className="w-3 h-3" /> Seret gambar untuk memposisikannya
                </div>
              )}
            </div>
          </div>

          <EditorToolPanel
            activeTab={tool}
            onTabChange={(t) => {
              setTool(t as any);
              setSelectedTextId(null);
            }}
            onRemoveImage={handleRemoveImage}
            isPanelOpen={isPanelOpen}
            onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
          >
            {tool === "photo" && (
              <LayoutTab
                aspectRatios={aspectRatios}
                activeRatioName={activeRatioName}
                onRatioChange={(width, height, name) => {
                  setCanvasWidth(width);
                  setCanvasHeight(height);
                  setActiveRatioName(name);
                }}
                bgPresets={bgPresets}
                bgColor={bgColor}
                onBgColorChange={setBgColor}
                imageScale={imageScale}
                onScaleChange={setImageScale}
                onReset={handleResetPhoto}
              />
            )}
            {tool === "filter" && (
              <FilterTab
                filtersPreset={filtersPreset}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                thumbnailUrl={thumbnailUrl}
              />
            )}
            {tool === "draw" && (
              <DrawTab
                brushColor={brushColor}
                onBrushColorChange={setBrushColor}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                colorsList={colorsList}
                onUndo={handleUndoDraw}
                strokeCount={strokes.length}
              />
            )}
            {tool === "text" && (
              <TextTab
                inputText={inputText}
                onInputTextChange={setInputText}
                onAddText={handleAddText}
                selectedTextId={selectedTextId}
                onDeleteText={handleDeleteText}
                fontStyle={fontStyle}
                onFontStyleChange={setFontStyle}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                fontColor={fontColor}
                onFontColorChange={setFontColor}
                fontsList={fontsList}
                colorsList={colorsList}
              />
            )}
          </EditorToolPanel>
        </div>
      ) : (
        <CaptionStep
          caption={caption}
          onCaptionChange={(e) => setCaption(e.target.value)}
          imagePreview={imagePreview}
          onRemoveImage={handleRemoveImage}
          avatarUrl={user?.avatarUrl}
          username={user?.username}
          name={user?.name ?? "?"}
        />
      )}
    </div>
  );
}
