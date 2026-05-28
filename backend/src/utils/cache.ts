type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

type CacheMetrics = {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
};

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: CacheMetrics = { hits: 0, misses: 0, sets: 0, deletes: 0 };

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
    this.metrics.sets++;
  }

  /**
   * Mengambil data dari cache jika ada dan belum kedaluwarsa
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Jika sudah lewat masa aktif, hapus dari memori
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    this.metrics.hits++;
    return entry.data as T;
  }

  /**
   * Menghapus cache spesifik (Invalidasi)
   */
  delete(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.metrics.deletes++;
    }
  }

  /**
   * Menghapus cache berdasarkan pola substring (Pattern Invalidation)
   * Contoh: deletePattern("posts:feed:") akan menghapus semua feed cache
   */
  deletePattern(pattern: string): void {
    let deletedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      this.metrics.deletes += deletedCount;
      if (process.env.DEBUG_CACHE === "true") {
        console.log(`🗑️ Cache invalidated: ${deletedCount} entries matching pattern "${pattern}"`);
      }
    }
  }

  /**
   * Mengosongkan seluruh cache di memori
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    if (process.env.DEBUG_CACHE === "true") {
      console.log(`🗑️ Cache cleared: ${size} entries removed`);
    }
  }

  /**
   * Mendapatkan metrics cache (hit rate, miss rate, dll)
   */
  getMetrics(): CacheMetrics & { hitRate: string; size: number } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? ((this.metrics.hits / total) * 100).toFixed(2) : "0.00";
    return {
      ...this.metrics,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
    };
  }

  /**
   * Reset metrics (untuk testing atau monitoring)
   */
  resetMetrics(): void {
    this.metrics = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }
}

export const localCache = new MemoryCache();
