import { PrismaClient } from "@prisma/client";

// Inisialisasi client utama dan cadangan
const primaryUrl = process.env.DATABASE_URL_SUPABASE || process.env.DATABASE_URL;
const secondaryUrl = process.env.DATABASE_URL_NEON;

export const primaryPrisma = new PrismaClient({
  datasources: primaryUrl ? { db: { url: primaryUrl } } : undefined,
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

export const secondaryPrisma = secondaryUrl
  ? new PrismaClient({
      datasources: { db: { url: secondaryUrl } },
      log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    })
  : null;

// Helper untuk mendapatkan daftar client database yang aktif
function getClients(): PrismaClient[] {
  const list: PrismaClient[] = [primaryPrisma];
  if (secondaryPrisma) {
    list.push(secondaryPrisma);
  }
  return list;
}

// Kumpulan nama method query bawaan Prisma yang bertindak sebagai pembacaan (Read)
const READ_METHODS = new Set([
  "findMany",
  "findUnique",
  "findFirst",
  "count",
  "aggregate",
  "groupBy",
  "findRaw",
]);

// Jalankan Operasi Baca (Race Mode - Siapa cepat dia dapat)
async function runRead(targetProp: string, method: string, args: any[]) {
  const clients = getClients();
  if (clients.length === 1) {
    return (clients[0] as any)[targetProp][method](...args);
  }

  // Jalankan kueri ke kedua DB, kembalikan hasil dari DB pertama yang berhasil merespon
  const promises = clients.map(client =>
    (client as any)[targetProp][method](...args)
  );
  return Promise.any(promises);
}

// Jalankan Operasi Tulis (Sync-All Mode - Tulis ke semua database aktif)
async function runWrite(targetProp: string, method: string, args: any[]) {
  const clients = getClients();
  if (clients.length === 1) {
    return (clients[0] as any)[targetProp][method](...args);
  }

  // Tulis secara paralel ke kedua DB
  const results = await Promise.allSettled(
    clients.map(client => (client as any)[targetProp][method](...args))
  );

  const fulfilled = results.filter(r => r.status === "fulfilled") as PromiseFulfilledResult<any>[];
  
  if (fulfilled.length === 0) {
    // Jika keduanya gagal menulis, lemparkan error DB utama
    const rejected = results[0] as PromiseRejectedResult;
    throw rejected.reason;
  }

  // Kembalikan hasil dari data yang sukses disimpan
  return fulfilled[0].value;
}

// Export custom DB proxy yang meniru PrismaClient asli
export const db = new Proxy(primaryPrisma, {
  get(target, prop) {
    // Jika memanggil fungsi bawaan Prisma tingkat tinggi ($transaction atau raw query)
    if (typeof prop === "string" && prop.startsWith("$")) {
      if (prop === "$transaction" || prop === "$executeRaw" || prop === "$queryRaw") {
        return async (...args: any[]) => {
          const clients = getClients();
          if (clients.length === 1) {
            return (clients[0] as any)[prop](...args);
          }
          // Transaksi selalu disinkronisasikan ke kedua DB
          const results = await Promise.allSettled(
            clients.map(client => (client as any)[prop](...args))
          );
          const fulfilled = results.filter(r => r.status === "fulfilled") as PromiseFulfilledResult<any>[];
          if (fulfilled.length === 0) {
            const rejected = results[0] as PromiseRejectedResult;
            throw rejected.reason;
          }
          return fulfilled[0].value;
        };
      }
      return Reflect.get(target, prop);
    }

    // Jika memanggil delegasi model database (misal: db.post, db.user)
    if (typeof prop === "string" && prop in target) {
      const modelDelegate = Reflect.get(target, prop);
      if (typeof modelDelegate === "object" && modelDelegate !== null) {
        return new Proxy(modelDelegate, {
          get(modelTarget, method) {
            if (typeof method === "string") {
              const originalMethod = Reflect.get(modelTarget, method);
              if (typeof originalMethod === "function") {
                return (...args: any[]) => {
                  if (READ_METHODS.has(method)) {
                    return runRead(prop, method, args);
                  } else {
                    return runWrite(prop, method, args);
                  }
                };
              }
            }
            return Reflect.get(modelTarget, method);
          },
        });
      }
    }

    return Reflect.get(target, prop);
  },
}) as unknown as PrismaClient;
