import type { Appointment } from "../types";
import {
  getAppointmentsByDonor, getAppointmentsByHospital, getAppointmentById,
  addAppointment as dbAddAppointment,
  updateAppointment as dbUpdateAppointment,
  cancelAppointment as dbCancelAppointment,
  confirmAppointment as dbConfirmAppointment,
  completeAppointment as dbCompleteAppointment,
  getAppointmentsByRequest, getBookedTimeSlots,
  TIME_SLOTS, clearRequestDb,
} from "../db/requests";

// ─── Wrappers for backward compat (screens use single-id signatures) ──────────

export function cancelAppointment(id: string): boolean {
  const appt = getAppointmentById(id);
  if (!appt) return false;
  return dbCancelAppointment(appt.requestId, id);
}

export function confirmAppointment(id: string): boolean {
  const appt = getAppointmentById(id);
  if (!appt) return false;
  return dbConfirmAppointment(appt.requestId, id);
}

export function completeAppointment(id: string): boolean {
  const appt = getAppointmentById(id);
  if (!appt) return false;
  return dbCompleteAppointment(appt.requestId, id);
}

export function rejectAppointment(id: string): boolean {
  return cancelAppointment(id);
}

export function addAppointment(appt: Appointment): boolean {
  return dbAddAppointment(appt.requestId, appt);
}

export function updateAppointment(id: string, updates: Partial<Appointment>): boolean {
  const appt = getAppointmentById(id);
  if (!appt) return false;
  return dbUpdateAppointment(appt.requestId, id, updates);
}

export {
  getAppointmentsByDonor, getAppointmentsByHospital, getAppointmentById,
  getAppointmentsByRequest, getBookedTimeSlots, TIME_SLOTS,
};

export function clearAppointmentStore(): void {
  clearRequestDb();
}
