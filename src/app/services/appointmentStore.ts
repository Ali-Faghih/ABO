import { api } from "./api";
import type { Appointment } from "../types";

export async function getAppointmentsByDonor(donorId: string): Promise<Appointment[]> {
  return api<Appointment[]>("GET", `/requests/appointments/donor/${donorId}`);
}

export async function getAppointmentsByHospital(hospitalId: string): Promise<Appointment[]> {
  return api<Appointment[]>("GET", `/requests/appointments/hospital/${hospitalId}`);
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const all = await api<Appointment[]>("GET", "/requests");
    return all.find((a) => a.id === id) || null;
  } catch {
    return null;
  }
}

export async function getAppointmentsByRequest(requestId: string): Promise<Appointment[]> {
  return api<Appointment[]>("GET", `/requests/${requestId}/appointments`);
}

export async function addAppointment(appt: Appointment): Promise<boolean> {
  try {
    await api("POST", `/requests/${appt.requestId}/appointments`, appt);
    return true;
  } catch {
    return false;
  }
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<boolean> {
  try {
    await api("PUT", `/requests/appointments/${id}`, updates);
    return true;
  } catch {
    return false;
  }
}

export async function cancelAppointment(id: string): Promise<boolean> {
  return updateAppointment(id, { status: "cancelled" });
}

export async function confirmAppointment(id: string): Promise<boolean> {
  return updateAppointment(id, { status: "confirmed" });
}

export async function completeAppointment(id: string): Promise<boolean> {
  return updateAppointment(id, { status: "completed" });
}

export async function rejectAppointment(id: string): Promise<boolean> {
  return cancelAppointment(id);
}

// ─── Hospital-initiated invitations ──────────────────────────────────────────
export async function inviteDonor(invite: {
  requestId: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  date: string;
  time: string;
}): Promise<boolean> {
  try {
    await api("POST", `/requests/appointments/invite`, invite);
    return true;
  } catch {
    return false;
  }
}

export async function getDonorInvitations(donorId: string): Promise<Appointment[]> {
  return api<Appointment[]>("GET", `/requests/invitations/donor/${donorId}`);
}

export async function respondToInvitation(id: string, status: "confirmed" | "cancelled"): Promise<boolean> {
  try {
    await api("PUT", `/requests/appointments/invitation/${id}/respond`, { status });
    return true;
  } catch {
    return false;
  }
}

export async function acceptInvitation(id: string): Promise<boolean> {
  return respondToInvitation(id, "confirmed");
}

export async function declineInvitation(id: string): Promise<boolean> {
  return respondToInvitation(id, "cancelled");
}

export async function getBookedTimeSlots(hospitalId: string, date: string): Promise<string[]> {
  return api<string[]>("GET", `/requests/booked-slots/${hospitalId}?date=${encodeURIComponent(date)}`);
}

export const TIME_SLOTS = [
  "۰۸:۰۰", "۰۸:۳۰", "۰۹:۰۰", "۰۹:۳۰", "۱۰:۰۰", "۱۰:۳۰",
  "۱۱:۰۰", "۱۱:۳۰", "۱۲:۰۰", "۱۲:۳۰", "۱۳:۰۰", "۱۳:۳۰",
  "۱۴:۰۰", "۱۴:۳۰", "۱۵:۰۰", "۱۵:۳۰", "۱۶:۰۰", "۱۶:۳۰",
  "۱۷:۰۰", "۱۷:۳۰", "۱۸:۰۰", "۱۸:۳۰", "۱۹:۰۰", "۱۹:۳۰",
];
