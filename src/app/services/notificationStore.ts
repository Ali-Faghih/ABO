import { api } from "./api";
import type { DonorNotification } from "../types";

export type AppNotification = DonorNotification;

export async function getNotifications(userId: string): Promise<DonorNotification[]> {
  const notifs = await api<any[]>("GET", `/donors/${userId}/notifications`);
  return notifs.map((n) => ({
    ...n,
    read: !!n.read,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const notifs = await getNotifications(userId);
  return notifs.filter((n) => !n.read).length;
}

export async function markAllAsRead(userId: string): Promise<void> {
  await api("PUT", `/donors/${userId}/notifications/read-all`);
}

export async function addNotification(userId: string, notif: Partial<DonorNotification>): Promise<void> {
  await api("POST", `/donors/${userId}/notifications`, notif);
}

export async function seedDonorNotifications(_donor: any): Promise<void> {
  // Notifications are already seeded on the backend for demo accounts
}
