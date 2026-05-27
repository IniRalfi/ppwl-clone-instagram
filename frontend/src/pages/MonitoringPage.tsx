import { useEffect, useState } from "react";
import { Server, Database, Cloud, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { apiClient } from "../services/api.client";

interface MonitorData {
  timestamp: string;
  databases: {
    primary: {
      name: string;
      status: "online" | "offline";
      latencyMs: number;
      error: string | null;
    };
    secondary: {
      name: string;
      status: "online" | "offline" | "not_configured";
      latencyMs: number;
      error: string | null;
    };
  };
  storage: {
    s3: {
      status: "online" | "offline";
      bucket: string;
      region: string;
      error: string | null;
    };
    cloudinary: {
      status: "online" | "offline";
      cloudName: string;
      error: string | null;
    };
  };
  systemScore: number;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulateDown, setSimulateDown] = useState(false);

  const fetchStatus = async (isSimulated = simulateDown) => {
    try {
      setRefreshing(true);
      const res = await apiClient.get<MonitorData>(
        `/monitoring${isSimulated ? "?simulate_down=true" : ""}`
      );
      setData(res);
    } catch (error) {
      console.error("Gagal memuat status monitoring:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh setiap 30 detik
    const interval = setInterval(() => fetchStatus(simulateDown), 30000);
    return () => clearInterval(interval);
  }, [simulateDown]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-ig-text">
        <RefreshCw className="w-10 h-10 animate-spin text-ig-secondary-text mb-4" />
        <p className="text-[15px] font-medium tracking-wide">Menghubungkan ke System Monitoring...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 border-emerald-500";
    if (score >= 60) return "text-amber-500 border-amber-500";
    return "text-rose-500 border-rose-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Online
          </span>
        );
      case "offline":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" /> Offline
          </span>
        );
      case "not_configured":
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-ig-elevated-bg text-ig-secondary-text border border-ig-border">
            <AlertCircle className="w-3.5 h-3.5" /> Off / Not Configured
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-ig-text">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-ig-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">System Health & Live Monitoring</h1>
          <p className="text-[14px] text-ig-secondary-text">
            Terakhir diperbarui: {data ? new Date(data.timestamp).toLocaleTimeString() : "-"} (Otomatis setiap 30 detik)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const nextVal = !simulateDown;
              setSimulateDown(nextVal);
              fetchStatus(nextVal);
            }}
            className={`px-4 py-2 rounded-xl text-[14px] font-semibold border transition-all active:scale-95 ${
              simulateDown
                ? "bg-rose-500/10 border-rose-500 text-rose-500 hover:bg-rose-500/20"
                : "bg-ig-elevated-bg border-ig-border text-ig-secondary-text hover:text-ig-text hover:bg-ig-border"
            }`}
          >
            {simulateDown ? "⚠️ Hentikan Simulasi" : "💥 Simulasi Outage"}
          </button>
          <button
            onClick={() => fetchStatus(simulateDown)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ig-elevated-bg hover:bg-ig-border border border-ig-border text-[14px] font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-ig-elevated-bg rounded-2xl border border-ig-border p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[14px] font-semibold text-ig-secondary-text mb-3">Overall Health Score</span>
          <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-1 ${getScoreColor(data?.systemScore ?? 0)}`}>
            <span className="text-3xl font-extrabold">{data?.systemScore}%</span>
          </div>
          <span className="text-xs text-ig-secondary-text">Semua sistem dalam kondisi prima</span>
        </div>

        <div className="md:col-span-2 bg-ig-elevated-bg rounded-2xl border border-ig-border p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Dual-Engine Active-Active Failover</h2>
            <p className="text-[14px] text-ig-secondary-text leading-relaxed">
              Arsitektur database kamu secara otomatis mengarahkan kueri baca (*Read*) ke database dengan respon tercepat (Supabase / Neon) dan mereplikasi penulisan (*Write*) ke kedua mesin secara bersamaan untuk mencegah kehilangan data.
            </p>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-ig-border text-xs text-ig-secondary-text">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Read: Race Mode
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Write: Sync-All Mode
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        {/* Databases Section */}
        <div>
          <h2 className="text-[15px] font-bold text-ig-secondary-text uppercase tracking-wider mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" /> Database Engines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary DB */}
            <div className="bg-ig-elevated-bg rounded-2xl border border-ig-border p-5 flex flex-col justify-between h-40">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[15px]">{data?.databases.primary.name}</h3>
                  <span className="text-xs text-ig-secondary-text">Database Utama</span>
                </div>
                {getStatusBadge(data?.databases.primary.status ?? "offline")}
              </div>
              <div className="flex items-end justify-between pt-4">
                <span className="text-xs text-ig-secondary-text">Latensi Kueri</span>
                <span className="text-lg font-bold">
                  {data?.databases.primary.latencyMs !== -1 ? `${data?.databases.primary.latencyMs} ms` : "N/A"}
                </span>
              </div>
              {data?.databases.primary.error && (
                <div className="mt-2 text-xs text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 truncate">
                  Error: {data.databases.primary.error}
                </div>
              )}
            </div>

            {/* Secondary DB (Neon) */}
            <div className="bg-ig-elevated-bg rounded-2xl border border-ig-border p-5 flex flex-col justify-between h-40">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[15px]">{data?.databases.secondary.name}</h3>
                  <span className="text-xs text-ig-secondary-text">Backup Engine</span>
                </div>
                {getStatusBadge(data?.databases.secondary.status ?? "not_configured")}
              </div>
              <div className="flex items-end justify-between pt-4">
                <span className="text-xs text-ig-secondary-text">Latensi Kueri</span>
                <span className="text-lg font-bold">
                  {data?.databases.secondary.latencyMs !== -1 ? `${data?.databases.secondary.latencyMs} ms` : "N/A"}
                </span>
              </div>
              {data?.databases.secondary.error && (
                <div className="mt-2 text-xs text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 truncate">
                  Error: {data.databases.secondary.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CDN Storage Section */}
        <div>
          <h2 className="text-[15px] font-bold text-ig-secondary-text uppercase tracking-wider mb-3 flex items-center gap-2">
            <Cloud className="w-4 h-4" /> Cloud Media Storage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AWS S3 */}
            <div className="bg-ig-elevated-bg rounded-2xl border border-ig-border p-5 flex flex-col justify-between h-40">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[15px]">AWS S3 Bucket</h3>
                  <span className="text-xs text-ig-secondary-text">CDN Utama ({data?.storage.s3.region})</span>
                </div>
                {getStatusBadge(data?.storage.s3.status ?? "offline")}
              </div>
              <div className="flex items-end justify-between pt-4">
                <span className="text-xs text-ig-secondary-text">Bucket</span>
                <span className="text-[13px] font-mono truncate max-w-[180px]" title={data?.storage.s3.bucket}>
                  {data?.storage.s3.bucket}
                </span>
              </div>
              {data?.storage.s3.error && (
                <div className="mt-2 text-xs text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 truncate">
                  Error: {data.storage.s3.error}
                </div>
              )}
            </div>

            {/* Cloudinary */}
            <div className="bg-ig-elevated-bg rounded-2xl border border-ig-border p-5 flex flex-col justify-between h-40">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[15px]">Cloudinary</h3>
                  <span className="text-xs text-ig-secondary-text">Media Fallback</span>
                </div>
                {getStatusBadge(data?.storage.cloudinary.status ?? "offline")}
              </div>
              <div className="flex items-end justify-between pt-4">
                <span className="text-xs text-ig-secondary-text">Cloud Name</span>
                <span className="text-[13px] font-mono truncate max-w-[180px]">
                  {data?.storage.cloudinary.cloudName}
                </span>
              </div>
              {data?.storage.cloudinary.error && (
                <div className="mt-2 text-xs text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 truncate">
                  Error: {data.storage.cloudinary.error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
