import { canDonateTo } from "../lib/bloodCompatibility";
import type { BloodRequest, DonorReadiness } from "../types";

const REQUESTS_KEY = "abo_requests";
const READINESS_KEY = "abo_readiness";

const VALID_STATUSES: ReadonlySet<string> = new Set(["active", "matched", "completed", "cancelled"]);
const ALLOWED_STATUS_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  active: new Set(["matched", "cancelled"]),
  matched: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
};

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Blood Requests ────────────────────────────────────────────────────────────

export function getRequests(): BloodRequest[] {
  return read<BloodRequest>(REQUESTS_KEY);
}

export function getRequestById(id: string): BloodRequest | null {
  return getRequests().find((r) => r.id === id) ?? null;
}

export function getRequestsByHospital(hospitalId: string): BloodRequest[] {
  return getRequests().filter((r) => r.hospitalId === hospitalId);
}

export function getActiveRequests(): BloodRequest[] {
  return getRequests().filter((r) => r.status === "active" || r.status === "matched");
}

export function addRequest(req: BloodRequest): boolean {
  if (!req.id || !req.hospitalId || !req.bloodType || !req.units || !req.urgency) return false;
  if (!VALID_STATUSES.has(req.status)) return false;
  const all = getRequests();
  if (all.some((r) => r.id === req.id)) return false;
  all.push(req);
  write(REQUESTS_KEY, all);
  return true;
}

export function updateRequest(id: string, updates: Partial<BloodRequest>): boolean {
  const all = getRequests();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  const prev = all[idx];
  if (updates.status && updates.status !== prev.status) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[prev.status];
    if (!allowed || !allowed.has(updates.status)) return false;
  }
  all[idx] = { ...prev, ...updates };
  write(REQUESTS_KEY, all);
  return true;
}

export function cancelRequest(id: string): boolean {
  return updateRequest(id, { status: "cancelled" });
}

// ─── Donor Readiness ───────────────────────────────────────────────────────────

export function getReadinessList(): DonorReadiness[] {
  return read<DonorReadiness>(READINESS_KEY);
}

export function getReadinessByDonor(donorId: string): DonorReadiness | null {
  return getReadinessList().find((r) => r.donorId === donorId) ?? null;
}

export function getAvailableDonors(bloodType?: string, city?: string): DonorReadiness[] {
  return getReadinessList().filter((r) => {
    if (!r.available) return false;
    if (bloodType && !canDonateTo(r.bloodType, bloodType)) return false;
    if (city && r.city !== city) return false;
    return true;
  });
}

export function setDonorReadiness(data: DonorReadiness): void {
  const all = getReadinessList();
  const idx = all.findIndex((r) => r.donorId === data.donorId);
  if (idx >= 0) { all[idx] = data; }
  else { all.push(data); }
  write(READINESS_KEY, all);
}

export function removeDonorReadiness(donorId: string): void {
  write(READINESS_KEY, getReadinessList().filter((r) => r.donorId !== donorId));
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────

function seed(): void {
  if (read<BloodRequest>(REQUESTS_KEY).length > 0) return;

  const now = new Date();
  const toPersian = (d: Date) => d.toLocaleDateString("fa-IR");

  const seedRequests: BloodRequest[] = [
    { id: "REQ-001", hospitalId: "HOSP-001", hospitalName: "بیمارستان امام خمینی", bloodType: "O-", units: 2, urgency: "فوری", deadline: "۱۴۰۳/۰۴/۱۰", status: "active", matched: 1, city: "تهران", createdAt: toPersian(now) },
    { id: "REQ-002", hospitalId: "HOSP-002", hospitalName: "بیمارستان شریعتی", bloodType: "A+", units: 1, urgency: "معمولی", deadline: "۱۴۰۳/۰۴/۱۵", status: "active", matched: 0, city: "تهران", createdAt: toPersian(now) },
    { id: "REQ-003", hospitalId: "HOSP-003", hospitalName: "بیمارستان مهراد", bloodType: "B+", units: 3, urgency: "فوری", deadline: "۱۴۰۳/۰۴/۰۸", status: "active", matched: 2, city: "تهران", createdAt: toPersian(now) },
    { id: "REQ-004", hospitalId: "HOSP-004", hospitalName: "سازمان انتقال خون", bloodType: "AB-", units: 1, urgency: "معمولی", deadline: "۱۴۰۳/۰۴/۲۰", status: "active", matched: 0, city: "تهران", createdAt: toPersian(now) },
    { id: "REQ-005", hospitalId: "HOSP-005", hospitalName: "بیمارستان توس", bloodType: "A-", units: 2, urgency: "معمولی", deadline: "۱۴۰۳/۰۴/۲۵", status: "active", matched: 0, city: "مشهد", createdAt: toPersian(now) },
    { id: "REQ-006", hospitalId: "HOSP-001", hospitalName: "بیمارستان امام خمینی", bloodType: "AB+", units: 3, urgency: "معمولی", deadline: "۱۴۰۳/۰۳/۲۸", status: "completed", matched: 3, city: "تهران", createdAt: "۲۸ خرداد ۱۴۰۳" },
  ];

  write(REQUESTS_KEY, seedRequests);
}

seed();

// ─── Data Cleanup ─────────────────────────────────────────────────────────────

export function clearRequestStore(): void {
  localStorage.removeItem(REQUESTS_KEY);
  localStorage.removeItem(READINESS_KEY);
}
