/**
 * Kompres, ubah ukuran, dan potong gambar sesuai rasio aspek standar Instagram.
 * Instagram membatasi rasio aspek postingan feed antara:
 * - Portrait Tertinggi: 4:5 (rasio 0.8)
 * - Landscape Terlebar: 1.91:1 (rasio 1.91)
 * Jika gambar melebihi batas ini, gambar akan otomatis di-crop di bagian tengah.
 * 
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
        
        // Hitung rasio aspek asli
        const originalRatio = img.width / img.height;
        
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // Batasan aspek rasio Instagram: Min 0.8 (4:5) dan Max 1.91 (1.91:1)
        if (originalRatio < 0.8) {
          // Terlalu tinggi/vertikal (misal 9:16), potong atas & bawah agar jadi 4:5 (0.8)
          sourceHeight = img.width / 0.8;
          sourceY = (img.height - sourceHeight) / 2;
        } else if (originalRatio > 1.91) {
          // Terlalu lebar/horizontal (misal 21:9), potong kiri & kanan agar jadi 1.91:1 (1.91)
          sourceWidth = img.height * 1.91;
          sourceX = (img.width - sourceWidth) / 2;
        }

        // Hitung ukuran dimensi output canvas berdasarkan area yang di-crop
        let destWidth = sourceWidth;
        let destHeight = sourceHeight;

        // Skala dimensi agar pas dengan batas maxWidth & maxHeight
        if (destWidth > destHeight) {
          if (destWidth > maxWidth) {
            destHeight = Math.round((destHeight * maxWidth) / destWidth);
            destWidth = maxWidth;
          }
        } else {
          if (destHeight > maxHeight) {
            destWidth = Math.round((destWidth * maxHeight) / destHeight);
            destHeight = maxHeight;
          }
        }

        canvas.width = destWidth;
        canvas.height = destHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Gambar ulang area ter-crop ke canvas dengan ukuran dimensi baru
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          destWidth,
          destHeight
        );

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
