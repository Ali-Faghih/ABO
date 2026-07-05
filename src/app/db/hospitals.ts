import type { HospitalRegistrationData } from "../types";
import { SEED_HOSPITALS, getDemoHospitalIds } from "../services/registryDb";

const DB_KEY = "abo_db_hospitals";

export interface DbHospital {
  id: string;
  hospitalId: string;
  password: string;
  name: string;
  hospitalType: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  licenseNumber: string;
  managerFirstName: string;
  managerLastName: string;
  managerNationalId: string;
  managerPosition: string;
  managerPhone: string;
  activeRequests: number;
  totalDonors: number;
  totalDonations: number;
  rating: number;
  beds: number;
  founded: string;
  isListed: boolean;
  joinDate: string;
}

function read(): DbHospital[] {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DbHospital[];
  } catch {
    return [];
  }
}

function write(data: DbHospital[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function migrateFromOldStorage(): void {
  const oldUsersKey = "abo_users";
  const oldListKey = "abo_listed_hospitals";
  if (!localStorage.getItem(oldUsersKey)) return;
  try {
    const old = JSON.parse(localStorage.getItem(oldUsersKey) || "[]");
    const oldList: string[] = JSON.parse(localStorage.getItem(oldListKey) || "[]");
    if (!Array.isArray(old)) return;
    const hospitals = old.filter((u: any) => u.type === "hospital").map((u: any) => ({
      id: u.id, hospitalId: u.username, password: u.password,
      name: u.name, hospitalType: u.hospitalType || "",
      city: u.city || "", province: u.province || "", address: u.address || "",
      phone: u.phone || "", licenseNumber: u.licenseNumber || "",
      managerFirstName: u.managerFirstName || "", managerLastName: u.managerLastName || "",
      managerNationalId: u.managerNationalId || "", managerPosition: u.managerPosition || "",
      managerPhone: u.managerPhone || "",
      activeRequests: u.activeRequests || 0, totalDonors: u.totalDonors || 0,
      totalDonations: u.totalDonations || 0, rating: u.rating || 0,
      beds: u.beds || 0, founded: u.founded || "",
      isListed: oldList.includes(u.username),
      joinDate: u.joinDate || new Date().toLocaleDateString("fa-IR"),
    }));
    if (hospitals.length > 0) write(hospitals);
    localStorage.removeItem(oldUsersKey);
    localStorage.removeItem(oldListKey);
  } catch { /* skip migration */ }
}

migrateFromOldStorage();

function seedDemoHospitals(): void {
  if (read().length > 0) return;
  const today = new Date().toLocaleDateString("fa-IR");
  const h = SEED_HOSPITALS;
  const demoIds = getDemoHospitalIds();
  const seedData: [number, string, string, number, number, number, number, number, string][] = [
    [0, "احمد", "رضایی", "دولتی", 1, 3, 1, 350, "۱۳۴۲"],
    [1, "محمد", "کریمی", "دانشگاهی - آموزشی", 1, 2, 0, 280, "۱۳۵۰"],
    [2, "سعید", "احمدی", "دولتی", 1, 5, 2, 200, "۱۳۸۵"],
    [3, "دکتر", "نوروزی", "دولتی", 1, 10, 5, 100, "۱۳۵۳"],
    [4, "رضا", "موسوی", "تأمین اجتماعی", 1, 1, 0, 150, "۱۳۹۰"],
  ];

  const hospitals: DbHospital[] = seedData.map(([idx, mgrF, mgrL, hospType, ar, td, tdon, beds, founded]) => ({
    id: `seed-hosp-00${idx + 1}`,
    hospitalId: demoIds[idx],
    password: "12345678",
    name: h[idx].name,
    hospitalType: hospType,
    city: h[idx].city,
    province: h[idx].province,
    address: ["خیابان ولیعصر، تهران", "خیابان کارگر شمالی، تهران", "خیابان سینا، تهران", "خیابان نیایش، تهران", "خیابان انقلاب اسلامی، تهران"][idx],
    phone: `021-611${12345 + idx * 11111}`.slice(0, 12),
    licenseNumber: h[idx].licenseNumber,
    managerFirstName: mgrF,
    managerLastName: mgrL,
    managerNationalId: "",
    managerPosition: ["مدیر عامل", "رئیس بیمارستان", "مدیر عامل", "مدیر عامل", "مدیر عامل"][idx],
    managerPhone: `0912111100${idx + 1}`,
    activeRequests: ar,
    totalDonors: td,
    totalDonations: tdon,
    rating: [4.5, 4.2, 4.7, 4.8, 4.0][idx],
    beds,
    founded,
    isListed: idx !== 1 && idx !== 4,
    joinDate: today,
  }));
  write(hospitals);
}

seedDemoHospitals();

export function getHospitals(): DbHospital[] {
  return read();
}

export function getHospitalById(id: string): DbHospital | null {
  return read().find((h) => h.id === id) ?? null;
}

export function getHospitalByHospitalId(hospitalId: string): DbHospital | null {
  return read().find((h) => h.hospitalId === hospitalId) ?? null;
}

export function findHospitalUser(username: string, password: string): DbHospital | null {
  return read().find((h) => h.hospitalId === username.trim() && h.password === password) ?? null;
}

export function hospitalUsernameExists(hospitalId: string): boolean {
  return read().some((h) => h.hospitalId === hospitalId);
}

export function addHospital(data: HospitalRegistrationData, id: string): DbHospital | null {
  if (hospitalUsernameExists(data.hospitalId)) return null;
  const hospital: DbHospital = {
    id,
    hospitalId: data.hospitalId,
    password: data.password,
    name: data.name,
    hospitalType: data.hospitalType,
    city: data.city,
    province: data.province,
    address: data.address,
    phone: data.phone,
    licenseNumber: data.licenseNumber,
    managerFirstName: data.managerFirstName,
    managerLastName: data.managerLastName,
    managerNationalId: data.managerNationalId,
    managerPosition: data.managerPosition,
    managerPhone: data.managerPhone,
    activeRequests: 0,
    totalDonors: 0,
    totalDonations: 0,
    rating: 0,
    beds: 0,
    founded: "",
    isListed: false,
    joinDate: new Date().toLocaleDateString("fa-IR"),
  };
  const all = read();
  all.push(hospital);
  write(all);
  return hospital;
}

export function updateHospital(id: string, updates: Partial<DbHospital>): boolean {
  const all = read();
  const idx = all.findIndex((h) => h.id === id);
  if (idx < 0) return false;
  all[idx] = { ...all[idx], ...updates };
  write(all);
  return true;
}

// ─── Listing ───────────────────────────────────────────────────────────────────

export function getListedHospitalIds(): string[] {
  return read().filter((h) => h.isListed).map((h) => h.hospitalId);
}

export function isHospitalListed(hospitalId: string): boolean {
  return read().some((h) => h.hospitalId === hospitalId && h.isListed);
}

export function setHospitalListed(hospitalId: string, listed: boolean): void {
  const all = read();
  const idx = all.findIndex((h) => h.hospitalId === hospitalId);
  if (idx >= 0) { all[idx].isListed = listed; write(all); }
}

export function clearHospitalDb(): void {
  localStorage.removeItem(DB_KEY);
}
