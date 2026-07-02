import type { UserProfile, HospitalProfile, DonorProfile } from "../types";

const USERS_KEY = "abo_users";
const SESSION_KEY = "abo_session";

function isValidProfile(u: unknown): u is UserProfile {
  if (!u || typeof u !== "object") return false;
  const p = u as Record<string, unknown>;
  return typeof p.id === "string" && typeof p.type === "string" && typeof p.username === "string" && typeof p.password === "string";
}

function readUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidProfile);
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
}

function writeUsers(users: UserProfile[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── Seed Demo Accounts ────────────────────────────────────────────────────────

function seedDemoAccounts(): void {
  const existing = readUsers();
  if (existing.length > 0) return;

  const today = new Date().toLocaleDateString("fa-IR");

  const hospitals: HospitalProfile[] = [
    { type: "hospital", id: "seed-hosp-001", username: "HOSP-001", password: "12345678", name: "بیمارستان امام خمینی", hospitalType: "دولتی", city: "تهران", province: "تهران", address: "خیابان ولیعصر، تهران", phone: "021-61112345", licenseNumber: "IR-MOH-1001-1401", managerFirstName: "احمد", managerLastName: "رضایی", managerNationalId: "0012345601", managerPosition: "مدیر عامل", managerPhone: "09121111001", activeRequests: 1, totalDonors: 3, totalDonations: 1, rating: 4.5, beds: 350, founded: "۱۳۴۲" },
    { type: "hospital", id: "seed-hosp-002", username: "HOSP-002", password: "12345678", name: "بیمارستان شریعتی", hospitalType: "دانشگاهی - آموزشی", city: "تهران", province: "تهران", address: "خیابان کارگر شمالی، تهران", phone: "021-61223456", licenseNumber: "IR-MOH-1002-1401", managerFirstName: "محمد", managerLastName: "کریمی", managerNationalId: "0012345602", managerPosition: "رئیس بیمارستان", managerPhone: "09121111002", activeRequests: 1, totalDonors: 2, totalDonations: 0, rating: 4.2, beds: 280, founded: "۱۳۵۰" },
    { type: "hospital", id: "seed-hosp-003", username: "HOSP-003", password: "12345678", name: "بیمارستان مهراد", hospitalType: "خصوصی", city: "تهران", province: "تهران", address: "بلوار میرداماد، تهران", phone: "021-61334567", licenseNumber: "IR-MOH-1003-1401", managerFirstName: "سعید", managerLastName: "احمدی", managerNationalId: "0012345603", managerPosition: "مدیر عامل", managerPhone: "09121111003", activeRequests: 1, totalDonors: 5, totalDonations: 2, rating: 4.7, beds: 200, founded: "۱۳۸۵" },
    { type: "hospital", id: "seed-hosp-004", username: "HOSP-004", password: "12345678", name: "سازمان انتقال خون", hospitalType: "دولتی", city: "تهران", province: "تهران", address: "خیابان سهروردی شمالی، تهران", phone: "021-61445678", licenseNumber: "IR-MOH-1004-1400", managerFirstName: "دکتر", managerLastName: "نوروزی", managerNationalId: "0012345604", managerPosition: "مدیر عامل", managerPhone: "09121111004", activeRequests: 1, totalDonors: 10, totalDonations: 5, rating: 4.8, beds: 100, founded: "۱۳۵۳" },
    { type: "hospital", id: "seed-hosp-005", username: "HOSP-005", password: "12345678", name: "بیمارستان توس", hospitalType: "خصوصی", city: "مشهد", province: "خراسان رضوی", address: "بلوار توس، مشهد", phone: "051-32221122", licenseNumber: "IR-MOH-2001-1401", managerFirstName: "رضا", managerLastName: "موسوی", managerNationalId: "0012345605", managerPosition: "مدیر عامل", managerPhone: "09151111005", activeRequests: 1, totalDonors: 1, totalDonations: 0, rating: 4.0, beds: 150, founded: "۱۳۹۰" },
  ];

  const donors: DonorProfile[] = [
    { type: "donor", id: "seed-donor-001", username: "0012345678", password: "12345678", name: "علی محمدی", firstName: "علی", lastName: "محمدی", bloodType: "A+", city: "تهران", province: "تهران", phone: "09121111222", address: "خیابان ولیعصر، تهران", weight: 78, height: 178, eligible: true, joinDate: today, donations: 3, gender: "male" },
    { type: "donor", id: "seed-donor-002", username: "0012345679", password: "12345678", name: "سارا حسینی", firstName: "سارا", lastName: "حسینی", bloodType: "O-", city: "تهران", province: "تهران", phone: "09132223333", address: "خیابان انقلاب، تهران", weight: 62, height: 165, eligible: true, joinDate: today, donations: 1, gender: "female" },
    { type: "donor", id: "seed-donor-003", username: "0012345680", password: "12345678", name: "محمد رضایی", firstName: "محمد", lastName: "رضایی", bloodType: "B+", city: "تهران", province: "تهران", phone: "09143334444", address: "خیابان شریعتی، تهران", weight: 85, height: 182, eligible: false, nextEligible: "۱۴۰۳/۰۸/۱۵", lastDonation: "۱۴۰۳/۰۵/۱۵", joinDate: today, donations: 5, gender: "male" },
  ];

  writeUsers([...hospitals, ...donors]);
}

seedDemoAccounts();

export function findUser(username: string, password: string, type: UserProfile["type"]): UserProfile | null {
  const normalized = username.trim();
  return readUsers().find(
    (u) => u.type === type && u.username === normalized && u.password === password
  ) ?? null;
}

export function saveUser(user: UserProfile): void {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    if (users.some((u) => u.id === user.id)) {
      user = { ...user, id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}` };
    }
    users.push(user);
  }
  writeUsers(users);
}

export function getAllUsers(): UserProfile[] {
  return readUsers();
}

export function findUserByUsername(username: string): UserProfile | null {
  const normalized = username.trim();
  return readUsers().find((u) => u.username === normalized) ?? null;
}

export function usernameExists(username: string): boolean {
  const normalized = username.trim();
  return readUsers().some((u) => u.username === normalized);
}

export function getSessionUserId(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw) as { userId: string };
    return userId ?? null;
  } catch {
    return null;
  }
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getUserById(id: string): UserProfile | null {
  return readUsers().find((u) => u.id === id) ?? null;
}
