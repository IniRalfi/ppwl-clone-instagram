type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Menyimpan data ke dalam cache dengan batas waktu (TTL)
   * @param key Kunci unik cache
   * @param data Data yang ingin di-cache
   * @param ttlMs Time-To-Live dalam milidetik (default 15 detik)
   */
  set<T>(key: string, data: T, ttlMs: number = 15000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Mengambil data dari cache jika ada dan belum kedaluwarsa
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Jika sudah lewat masa aktif, hapus dari memori
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Menghapus cache spesifik (Invalidasi)
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Menghapus cache berdasarkan pola substring (Pattern Invalidation)
   * Contoh: deletePattern("posts:") akan menghapus semua key yang mengandung "posts:"
   */
  deletePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Mengosongkan seluruh cache di memori
   */
  clear(): void {
    this.cache.clear();
  }
}

export const localCache = new MemoryCache();
