import type { BloodRequest, Appointment, AppointmentStatus } from "../types";
import { SEED_HOSPITALS } from "../services/registryDb";

const DB_KEY = "abo_db_requests";

export interface DbRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  units: number;
  urgency: "فوری" | "معمولی";
  deadline: string;
  status: "active" | "matched" | "completed" | "cancelled";
  matched: number;
  city: string;
  createdAt: string;
  notes: string;
  appointments: Appointment[];
}

const VALID_STATUSES: ReadonlySet<string> = new Set(["active", "matched", "completed", "cancelled"]);
const ALLOWED_STATUS_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  active: new Set(["matched", "cancelled"]),
  matched: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
};
const VALID_APPT_TRANSITIONS: Record<AppointmentStatus, ReadonlySet<AppointmentStatus>> = {
  pending: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
};

function read(): DbRequest[] {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DbRequest[];
  } catch {
    return [];
  }
}

function write(data: DbRequest[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function migrateFromOldStorage(): void {
  const reqKey = "abo_requests";
  const apptKey = "abo_appointments";
  if (!localStorage.getItem(reqKey)) return;
  try {
    const requests: BloodRequest[] = JSON.parse(localStorage.getItem(reqKey) || "[]");
    const appointments: Appointment[] = JSON.parse(localStorage.getItem(apptKey) || "[]");
    if (!Array.isArray(requests)) return;
    const db: DbRequest[] = requests.map((r) => ({
      ...r,
      notes: r.notes || "",
      appointments: appointments.filter((a) => a.requestId === r.id),
    }));
    if (db.length > 0) write(db);
    localStorage.removeItem(reqKey);
    localStorage.removeItem(apptKey);
  } catch { /* skip migration */ }
}

migrateFromOldStorage();

function seedDemoRequests(): void {
  if (read().length > 0) return;
  const now = new Date();
  const toPersian = (d: Date) => d.toLocaleDateString("fa-IR");
  const h = SEED_HOSPITALS;

  const requests: DbRequest[] = [
    { id: "REQ-001", hospitalId: h[0].hospitalId, hospitalName: h[0].name, bloodType: "O-", units: 2, urgency: "فوری", deadline: "۱۴۰۳/۰۴/۱۰", status: "active", matched: 1, city: h[0].city, createdAt: toPersian(now), notes: "بیمار بدحال نیاز فوری دارد", appointments: [
      { id: "APPT-001", donorId: "seed-donor-001", donorName: "علی محمدی", hospitalId: h[0].hospitalId, hospitalName: h[0].name, requestId: "REQ-001", bloodType: "O-", date: "۱۴۰۳/۰۴/۰۸", time: "۰۹:۰۰", status: "confirmed", createdAt: toPersian(now) },
    ]},
    { id: "REQ-002", hospitalId: h[1].hospitalId, hospitalName: h[1].name, bloodType: "A+", units: 1, urgency: "معمولی", deadline: "۱۴۰۳/۰۴/۱۵", status: "active", matched: 0, city: h[1].city, createdAt: toPersian(now), notes: "", appointments: [] },
    { id: "REQ-003", hospitalId: h[2].hospitalId, hospitalName: h[2].name, bloodType: "B+", units: 3, urgency: "فوری", deadline: "۱۴۰۳/۰۴/۰۸", status: "active", matched: 2, city: h[2].city, createdAt: toPersian(now), notes: "سه بیمار نیاز دارند", appointments: [
      { id: "APPT-002", donorId: "seed-donor-002", donorName: "محمد حسینی", hospitalId: h[2].hospitalId, hospitalName: h[2].name, requestId: "REQ-003", bloodType: "B+", date: "۱۴۰۳/۰۴/۰۷", time: "۱۰:۰۰", status: "pending", createdAt: toPersian(now) },
    ]},
    { id: "REQ-004", hospitalId: h[3].hospitalId, hospitalName: h[3].name, bloodType: "AB-", units: 1, urgency: "معمولی", deadline: "۱۴۰۳/۰۴/۲۰", status: "active", matched: 0, city: h[3].city, createdAt: toPersian(now), notes: "", appointments: [] },
    { id: "REQ-005", hospitalId: h[4].hospitalId, hospitalName: h[4].name, bloodType: "A-", units: 2, urgency: "معمولی", deadline: "۱۴۰۳/۰۴/۲۵", status: "active", matched: 0, city: h[4].city, createdAt: toPersian(now), notes: "", appointments: [] },
    { id: "REQ-006", hospitalId: h[0].hospitalId, hospitalName: h[0].name, bloodType: "AB+", units: 3, urgency: "معمولی", deadline: "۱۴۰۳/۰۳/۲۸", status: "completed", matched: 3, city: h[0].city, createdAt: "۲۸ خرداد ۱۴۰۳", notes: "تکمیل شده", appointments: [
      { id: "APPT-003", donorId: "seed-donor-001", donorName: "علی محمدی", hospitalId: h[0].hospitalId, hospitalName: h[0].name, requestId: "REQ-006", bloodType: "AB+", date: "۱۴۰۳/۰۳/۲۷", time: "۱۱:۰۰", status: "completed", createdAt: "۲۷ خرداد ۱۴۰۳" },
    ]},
  ];

  write(requests);
}

seedDemoRequests();

// ─── Blood Request API ─────────────────────────────────────────────────────────

export function getRequests(): DbRequest[] {
  return read();
}

export function getRequestById(id: string): DbRequest | null {
  return read().find((r) => r.id === id) ?? null;
}

export function getRequestsByHospital(hospitalId: string): DbRequest[] {
  return read().filter((r) => r.hospitalId === hospitalId);
}

export function getActiveRequests(): DbRequest[] {
  return read().filter((r) => r.status === "active" || r.status === "matched");
}

export function addRequest(req: BloodRequest): boolean {
  if (!req.id || !req.hospitalId || !req.bloodType || !req.units || !req.urgency) return false;
  if (!VALID_STATUSES.has(req.status)) return false;
  const all = read();
  if (all.some((r) => r.id === req.id)) return false;
  all.push({ ...req, notes: req.notes || "", appointments: [] });
  write(all);
  return true;
}

export function updateRequest(id: string, updates: Partial<BloodRequest>): boolean {
  const all = read();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  const prev = all[idx];
  if (updates.status && updates.status !== prev.status) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[prev.status];
    if (!allowed || !allowed.has(updates.status)) return false;
  }
  all[idx] = { ...prev, ...updates };
  write(all);
  return true;
}

export function cancelRequest(id: string): boolean {
  return updateRequest(id, { status: "cancelled" });
}

// ─── Appointment API (embedded in requests) ────────────────────────────────────

export function getAppointmentsByDonor(donorId: string): Appointment[] {
  return read().flatMap((r) => r.appointments.filter((a) => a.donorId === donorId));
}

export function getAppointmentsByHospital(hospitalId: string): Appointment[] {
  return read().flatMap((r) => r.appointments.filter((a) => a.hospitalId === hospitalId));
}

export function getAppointmentById(id: string): Appointment | null {
  for (const r of read()) {
    const a = r.appointments.find((ap) => ap.id === id);
    if (a) return a;
  }
  return null;
}

export function getAppointmentsByRequest(requestId: string): Appointment[] {
  const r = getRequestById(requestId);
  return r ? r.appointments : [];
}

function replaceAppointmentInRequest(requestId: string, appointmentId: string, updater: (a: Appointment) => Appointment): boolean {
  const all = read();
  const rIdx = all.findIndex((r) => r.id === requestId);
  if (rIdx < 0) return false;
  const aIdx = all[rIdx].appointments.findIndex((a) => a.id === appointmentId);
  if (aIdx < 0) return false;
  all[rIdx] = { ...all[rIdx], appointments: all[rIdx].appointments.map((a, i) => i === aIdx ? updater(a) : a) };
  write(all);
  return true;
}

export function addAppointment(requestId: string, appt: Appointment): boolean {
  const all = read();
  const rIdx = all.findIndex((r) => r.id === requestId);
  if (rIdx < 0) return false;
  if (all[rIdx].appointments.some((a) => a.id === appt.id)) return false;
  all[rIdx] = { ...all[rIdx], appointments: [...all[rIdx].appointments, appt] };
  write(all);
  return true;
}

export function updateAppointment(requestId: string, appointmentId: string, updates: Partial<Appointment>): boolean {
  return replaceAppointmentInRequest(requestId, appointmentId, (a) => {
    if (updates.status && updates.status !== a.status) {
      const allowed = VALID_APPT_TRANSITIONS[a.status];
      if (!allowed || !allowed.has(updates.status)) return a;
    }
    return { ...a, ...updates };
  });
}

export function cancelAppointment(requestId: string, id: string): boolean {
  return updateAppointment(requestId, id, { status: "cancelled" });
}

export function confirmAppointment(requestId: string, id: string): boolean {
  return updateAppointment(requestId, id, { status: "confirmed" });
}

export function completeAppointment(requestId: string, id: string): boolean {
  return updateAppointment(requestId, id, { status: "completed" });
}

export function getBookedTimeSlots(hospitalId: string, date: string): string[] {
  return read()
    .flatMap((r) => r.appointments)
    .filter((a) => a.hospitalId === hospitalId && a.date === date && a.status !== "cancelled")
    .map((a) => a.time);
}

export const TIME_SLOTS = [
  "۸:۰۰ - ۹:۰۰", "۹:۰۰ - ۱۰:۰۰", "۱۰:۰۰ - ۱۱:۰۰", "۱۱:۰۰ - ۱۲:۰۰",
  "۱۲:۰۰ - ۱۳:۰۰", "۱۳:۰۰ - ۱۴:۰۰", "۱۴:۰۰ - ۱۵:۰۰", "۱۵:۰۰ - ۱۶:۰۰",
];

export function clearRequestDb(): void {
  localStorage.removeItem(DB_KEY);
}
