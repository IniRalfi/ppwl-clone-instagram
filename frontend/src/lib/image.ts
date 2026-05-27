/**
 * Kompres dan ubah ukuran gambar menggunakan HTML5 Canvas
 * @param file - File asli dari input file
 * @param maxWidth - Batas lebar maksimal (default 1080px)
 * @param maxHeight - Batas tinggi maksimal (default 1080px)
 * @param quality - Kualitas kompresi 0.0 sampai 1.0 (default 0.8)
 */
export function compressImage(
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    // Jangan sentuh GIF untuk menjaga animasinya tetap berjalan
    if (file.type === "image/gif") {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek agar gambar tidak terdistorsi
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Gambar ulang dengan ukuran baru ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Tipe output optimal (PNG dirubah ke JPEG untuk kompresi maksimal)
        const outputType = file.type === "image/png" ? "image/jpeg" : file.type;

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            
            // Ubah kembali blob menjadi File dengan nama asli
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            const optimizedFile = new File([blob], `${nameWithoutExt}.jpg`, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          outputType,
          quality
        );
      };
    };
  });
}
