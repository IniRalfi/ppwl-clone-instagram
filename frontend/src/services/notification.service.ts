import { apiClient } from "./api.client";
import type { Notification } from "../../../shared/src/types/notification";

/** Ambil semua notifikasi untuk pengguna aktif */
export async function getNotifications(): Promise<Notification[]> {
  const res = await apiClient.get<{ data: Notification[] }>("/notifications");
  return res.data || [];
}
