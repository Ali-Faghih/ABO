import type { Appointment, AppointmentStatus } from "../types";

const APPOINTMENTS_KEY = "abo_appointments";

const VALID_TRANSITIONS: Record<AppointmentStatus, ReadonlySet<AppointmentStatus>> = {
  pending: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
};

function read(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(APPOINTMENTS_KEY);
    return [];
  }
}

function write(data: Appointment[]): void {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(data));
}

export function getAppointmentsByDonor(donorId: string): Appointment[] {
  return read().filter((a) => a.donorId === donorId);
}

export function getAppointmentsByHospital(hospitalId: string): Appointment[] {
  return read().filter((a) => a.hospitalId === hospitalId);
}

export function getAppointmentById(id: string): Appointment | null {
  return read().find((a) => a.id === id) ?? null;
}

export function addAppointment(a: Appointment): boolean {
  if (!a.id || !a.donorId || !a.hospitalId || !a.date) return false;
  if (!["pending", "confirmed", "completed", "cancelled"].includes(a.status)) return false;
  const all = read();
  if (all.some((x) => x.id === a.id)) return false;
  all.push(a);
  write(all);
  return true;
}

function transitionStatus(id: string, to: AppointmentStatus): boolean {
  const all = read();
  const idx = all.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  const from = all[idx].status;
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.has(to)) return false;
  all[idx] = { ...all[idx], status: to };
  write(all);
  return true;
}

export function cancelAppointment(id: string): boolean {
  return transitionStatus(id, "cancelled");
}

export function confirmAppointment(id: string): boolean {
  return transitionStatus(id, "confirmed");
}

export function rejectAppointment(id: string): boolean {
  return transitionStatus(id, "cancelled");
}

export function completeAppointment(id: string): boolean {
  return transitionStatus(id, "completed");
}

export function updateAppointment(id: string, updates: Partial<Appointment>): boolean {
  const all = read();
  const idx = all.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  if (updates.status && updates.status !== all[idx].status) {
    const allowed = VALID_TRANSITIONS[all[idx].status];
    if (!allowed || !allowed.has(updates.status)) return false;
  }
  all[idx] = { ...all[idx], ...updates };
  write(all);
  return true;
}

export function getAppointmentsByRequest(requestId: string): Appointment[] {
  return read().filter((a) => a.requestId === requestId);
}

export function getBookedTimeSlots(hospitalId: string, date: string): string[] {
  return read()
    .filter((a) => a.hospitalId === hospitalId && a.date === date && a.status !== "cancelled")
    .map((a) => a.time);
}

export const TIME_SLOTS = [
  "۸:۰۰ - ۹:۰۰",
  "۹:۰۰ - ۱۰:۰۰",
  "۱۰:۰۰ - ۱۱:۰۰",
  "۱۱:۰۰ - ۱۲:۰۰",
  "۱۲:۰۰ - ۱۳:۰۰",
  "۱۳:۰۰ - ۱۴:۰۰",
  "۱۴:۰۰ - ۱۵:۰۰",
  "۱۵:۰۰ - ۱۶:۰۰",
];

export function clearAppointmentStore(): void {
  localStorage.removeItem(APPOINTMENTS_KEY);
}
