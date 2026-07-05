import type { DonorProfile, DonorNotification } from "../types";
import { getDonorNotifications, getUnreadNotifCount, markAllNotifsRead, addDonorNotification } from "../db/donors";

// ─── Backward compat type alias ────────────────────────────────────────────────
export type AppNotification = DonorNotification;

// ─── Re-exports (backward compat) ──────────────────────────────────────────────
export { getDonorNotifications as getNotifications, getUnreadNotifCount as getUnreadCount, markAllNotifsRead as markAllAsRead, addDonorNotification as addNotification };

export function seedDonorNotifications(donor: DonorProfile): void {
  const existing = getDonorNotifications(donor.id);
  if (existing.length > 0) return;

  addDonorNotification(donor.id, { type: "appointment", title: "نوبت تأیید شد", message: "نوبت اهدای خون شما در بیمارستان امام خمینی برای فردا ساعت ۹ تأیید شد.", time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }), read: false });
  addDonorNotification(donor.id, { type: "reminder", title: "یادآوری نوبت", message: "فردا نوبت اهدای خون دارید. لطفاً شب قبل استراحت کافی داشته باشید.", time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }), read: false });
  addDonorNotification(donor.id, { type: "system", title: "آمادگی اهدا", message: "وضعیت اهدای شما به‌روز شد. هم‌اکنون آماده اهدا هستید.", time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }), read: false });
  addDonorNotification(donor.id, { type: "request", title: "درخواست جدید", message: "یک درخواست جدید برای گروه خونی O+ در شهر شما ثبت شده است.", time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }), read: true });
  addDonorNotification(donor.id, { type: "reminder", title: "تغذیه مناسب", message: "برای اهدای خون سالم، مصرف مواد غذایی حاوی آهن را فراموش نکنید.", time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }), read: true });
}
