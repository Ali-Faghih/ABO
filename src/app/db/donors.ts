import type { DonorNotification, DonorRegistrationData } from "../types";
import { findDonorInRegistry, getDemoDonorNationalIds } from "../services/registryDb";

const DB_KEY = "abo_db_donors";

export interface DbDonor {
  id: string;
  nationalId: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: "male" | "female";
  city: string;
  province: string;
  address: string;
  weight: number;
  height: number;
  bloodType: string;
  diseaseName: string;
  medicationName: string;
  readinessAvailable: boolean;
  readinessDate: string | null;
  eligible: boolean;
  nextEligible: string | null;
  lastDonation: string | null;
  joinDate: string;
  donations: number;
  notifications: DonorNotification[];
}

function read(): DbDonor[] {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DbDonor[];
  } catch {
    return [];
  }
}

function write(data: DbDonor[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function nextNotifId(donorId: string, all: DonorNotification[]): string {
  const max = all.reduce((m, n) => {
    const p = n.id.split("-").pop() || "0";
    return Math.max(m, parseInt(p, 10));
  }, 0);
  return `NOTIF-${donorId}-${String(max + 1).padStart(3, "0")}`;
}

function migrateFromOldStorage(): void {
  const oldKey = "abo_users";
  if (!localStorage.getItem(oldKey)) return;
  try {
    const old = JSON.parse(localStorage.getItem(oldKey) || "[]");
    if (!Array.isArray(old)) return;
    const donors = old.filter((u: any) => u.type === "donor").map((u: any) => ({
      id: u.id, nationalId: u.username, password: u.password,
      firstName: u.firstName, lastName: u.lastName,
      phone: u.phone || "", birthDate: u.birthDate || "", gender: u.gender || "male",
      city: u.city || "", province: u.province || "", address: u.address || "",
      weight: u.weight || 0, height: u.height || 0, bloodType: u.bloodType || "O+",
      diseaseName: u.diseaseName || "", medicationName: u.medicationName || "",
      readinessAvailable: false, readinessDate: null,
      eligible: u.eligible !== false, nextEligible: u.nextEligible || null,
      lastDonation: u.lastDonation || null, joinDate: u.joinDate || "",
      donations: u.donations || 0, notifications: [],
    }));
    if (donors.length > 0) write(donors);
    localStorage.removeItem(oldKey);
  } catch { /* skip migration */ }
}

migrateFromOldStorage();

function seedDemoDonors(): void {
  if (read().length > 0) return;
  const today = new Date().toLocaleDateString("fa-IR");
  const info = getDemoDonorNationalIds();
  const donors: DbDonor[] = info.map((d, i) => ({
    id: `seed-donor-00${i + 1}`,
    nationalId: d.nationalId,
    password: "12345678",
    firstName: d.firstName,
    lastName: d.lastName,
    phone: d.phone,
    birthDate: d.birthDate,
    gender: "male" as const,
    city: "تهران",
    province: "تهران",
    address: ["خیابان ولیعصر، تهران", "خیابان انقلاب، تهران", "خیابان شریعتی، تهران"][i],
    weight: [78, 62, 85][i],
    height: [178, 165, 182][i],
    bloodType: ["A+", "O-", "B+"][i],
    diseaseName: "",
    medicationName: "",
    readinessAvailable: false,
    readinessDate: null,
    eligible: [true, true, false][i],
    nextEligible: [null, null, "۱۴۰۳/۰۸/۱۵"][i],
    lastDonation: [null, null, "۱۴۰۳/۰۵/۱۵"][i],
    joinDate: today,
    donations: [3, 1, 5][i],
    notifications: [
      { id: `NOTIF-seed-donor-00${i + 1}-001`, type: "appointment", title: "نوبت تأیید شد", message: "نوبت اهدای خون شما در بیمارستان امام خمینی برای فردا ساعت ۹ تأیید شد.", time: "۱۰:۳۰", read: false },
      { id: `NOTIF-seed-donor-00${i + 1}-002`, type: "reminder", title: "یادآوری نوبت", message: "فردا نوبت اهدای خون دارید. لطفاً شب قبل استراحت کافی داشته باشید.", time: "۰۸:۰۰", read: false },
    ],
  }));
  write(donors);
}

seedDemoDonors();

export function getDonors(): DbDonor[] {
  return read();
}

export function getDonorById(id: string): DbDonor | null {
  return read().find((d) => d.id === id) ?? null;
}

export function getDonorByNationalId(nationalId: string): DbDonor | null {
  return read().find((d) => d.nationalId === nationalId) ?? null;
}

export function findDonorUser(username: string, password: string): DbDonor | null {
  return read().find((d) => d.nationalId === username.trim() && d.password === password) ?? null;
}

export function donorUsernameExists(nationalId: string): boolean {
  return read().some((d) => d.nationalId === nationalId);
}

export function addDonor(data: DonorRegistrationData, id: string): DbDonor | null {
  if (donorUsernameExists(data.nationalId)) return null;
  const registry = findDonorInRegistry(data.nationalId);
  const donor: DbDonor = {
    id,
    nationalId: data.nationalId,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    birthDate: registry?.birthDate || "",
    gender: data.gender,
    city: data.city,
    province: data.province,
    address: data.address,
    weight: data.weight || 0,
    height: data.height || 0,
    bloodType: data.bloodType,
    diseaseName: data.diseaseName || "",
    medicationName: data.medicationName || "",
    readinessAvailable: false,
    readinessDate: null,
    eligible: true,
    nextEligible: null,
    lastDonation: null,
    joinDate: new Date().toLocaleDateString("fa-IR"),
    donations: 0,
    notifications: [],
  };
  const all = read();
  all.push(donor);
  write(all);
  return donor;
}

export function updateDonor(id: string, updates: Partial<DbDonor>): boolean {
  const all = read();
  const idx = all.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  all[idx] = { ...all[idx], ...updates };
  write(all);
  return true;
}

// ─── Readiness ─────────────────────────────────────────────────────────────────

export function getDonorReadiness(donorId: string): { available: boolean; date: string | null } {
  const d = getDonorById(donorId);
  return d ? { available: d.readinessAvailable, date: d.readinessDate } : { available: false, date: null };
}

export function setDonorReadiness(donorId: string, available: boolean): boolean {
  return updateDonor(donorId, {
    readinessAvailable: available,
    readinessDate: available ? new Date().toLocaleDateString("fa-IR") : null,
  });
}

export function getAvailableDonors(bloodType?: string, city?: string): DbDonor[] {
  return read().filter((d) => {
    if (!d.readinessAvailable) return false;
    if (bloodType && d.bloodType !== bloodType) return false;
    if (city && d.city !== city) return false;
    return true;
  });
}

// ─── Notifications (embedded) ─────────────────────────────────────────────────

export function getDonorNotifications(donorId: string): DonorNotification[] {
  const d = getDonorById(donorId);
  return d ? [...d.notifications].sort((a, b) => b.time.localeCompare(a.time)) : [];
}

export function getUnreadNotifCount(donorId: string): number {
  return getDonorNotifications(donorId).filter((n) => !n.read).length;
}

export function markAllNotifsRead(donorId: string): void {
  const all = read();
  const idx = all.findIndex((d) => d.id === donorId);
  if (idx < 0) return;
  all[idx] = { ...all[idx], notifications: all[idx].notifications.map((n) => ({ ...n, read: true })) };
  write(all);
}

export function addDonorNotification(donorId: string, n: Omit<DonorNotification, "id">): void {
  const all = read();
  const idx = all.findIndex((d) => d.id === donorId);
  if (idx < 0) return;
  const notif: DonorNotification = { ...n, id: nextNotifId(donorId, all[idx].notifications) };
  all[idx] = { ...all[idx], notifications: [...all[idx].notifications, notif] };
  write(all);
}

export function clearDonorDb(): void {
  localStorage.removeItem(DB_KEY);
}
