import type { DonorProfile } from "../types";

const NOTIF_KEY = "abo_notifications";

export interface AppNotification {
  id: string;
  type: "appointment" | "request" | "system" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
  donorId: string;
}

function read(): AppNotification[] {
  try { const raw = localStorage.getItem(NOTIF_KEY); return raw ? JSON.parse(raw) as AppNotification[] : []; }
  catch { return []; }
}

function write(data: AppNotification[]): void {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(data));
}

function notifSortKey(id: string): number {
  const parts = id.split("-");
  const tail = parts[parts.length - 1];
  return parseInt(tail, 10) || 0;
}

export function getNotifications(donorId: string): AppNotification[] {
  return read().filter((n) => n.donorId === donorId).sort((a, b) => notifSortKey(b.id) - notifSortKey(a.id));
}

export function markAllAsRead(donorId: string): void {
  const all = read();
  for (const n of all) {
    if (n.donorId === donorId) n.read = true;
  }
  write(all);
}

export function getUnreadCount(donorId: string): number {
  return read().filter((n) => n.donorId === donorId && !n.read).length;
}

export function addNotification(n: AppNotification): void {
  const all = read();
  all.push(n);
  write(all);
}

export function seedDonorNotifications(donor: DonorProfile): void {
  const existing = read();
  if (existing.some((n) => n.donorId === donor.id)) return;

  const now = new Date();
  const tf = (h: number, m: number) => now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

  const seeds: AppNotification[] = [
    { id: `NOTIF-${donor.id}-001`, type: "appointment", title: "نوبت تأیید شد", message: `نوبت اهدای خون شما در بیمارستان امام خمینی برای فردا ساعت ۹ تأیید شد.`, time: tf(now.getHours(), now.getMinutes() - 5), read: false, donorId: donor.id },
    { id: `NOTIF-${donor.id}-002`, type: "reminder", title: "یادآوری نوبت", message: `فردا نوبت اهدای خون دارید. لطفاً شب قبل استراحت کافی داشته باشید.`, time: tf(now.getHours() - 2, now.getMinutes()), read: false, donorId: donor.id },
    { id: `NOTIF-${donor.id}-003`, type: "system", title: "آمادگی اهدا", message: `وضعیت اهدای شما به‌روز شد. هم‌اکنون آماده اهدا هستید.`, time: tf(now.getHours() - 24, now.getMinutes()), read: false, donorId: donor.id },
    { id: `NOTIF-${donor.id}-004`, type: "request", title: "درخواست جدید", message: `یک درخواست جدید برای گروه خونی O+ در شهر شما ثبت شده است.`, time: tf(now.getHours() - 48, now.getMinutes()), read: true, donorId: donor.id },
    { id: `NOTIF-${donor.id}-005`, type: "reminder", title: "تغذیه مناسب", message: `برای اهدای خون سالم، مصرف مواد غذایی حاوی آهن مانند گوشت قرمز، اسفناج و حبوبات را فراموش نکنید.`, time: tf(now.getHours() - 72, now.getMinutes()), read: true, donorId: donor.id },
  ];

  const all = read();
  all.push(...seeds);
  write(all);
}
