import { canDonateTo } from "../lib/bloodCompatibility";
import {
  getRequests, getRequestById, getRequestsByHospital, getActiveRequests,
  addRequest as dbAddRequest, updateRequest, cancelRequest as dbCancelRequest,
  clearRequestDb,
} from "../db/requests";
import { getDonors, getDonorById, addDonorNotification, setDonorReadiness as dbSetReadiness } from "../db/donors";
import { getHospitals, updateHospital } from "../db/hospitals";
import type { BloodRequest, DonorReadiness } from "../types";

// ─── Wrapped: addRequest also notifies matching donors + updates hospital ─────
export function addRequest(req: BloodRequest): boolean {
  const ok = dbAddRequest(req);
  if (ok) {
    // Update hospital's activeRequests count
    const hosp = getHospitals().find((h) => h.hospitalId === req.hospitalId);
    if (hosp) updateHospital(hosp.id, { activeRequests: hosp.activeRequests + 1 });

    // Notify all eligible donors in the same city
    const donors = getDonors().filter((d) => d.city === req.city && d.eligible);
    donors.forEach((d) => {
      addDonorNotification(d.id, {
        type: "request",
        title: `درخواست جدید ${req.bloodType}`,
        message: `یک درخواست جدید برای گروه خونی ${req.bloodType} در ${req.city} توسط ${req.hospitalName} ثبت شد.`,
        time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      });
    });
  }
  return ok;
}

export function cancelRequest(id: string): boolean {
  const req = getRequestById(id);
  if (!req) return false;

  // Notify donors who had appointments for this request
  req.appointments.forEach((a) => {
    addDonorNotification(a.donorId, {
      type: "system",
      title: "لغو درخواست",
      message: `درخواست ${req.bloodType} توسط ${req.hospitalName} لغو شد.`,
      time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    });
  });

  return dbCancelRequest(id);
}

// ─── Re-export rest ────────────────────────────────────────────────────────────
export { getRequests, getRequestById, getRequestsByHospital, getActiveRequests, updateRequest };

export function clearRequestStore(): void {
  clearRequestDb();
}

// ─── Donor Readiness (now in donors db, mapped here for backward compat) ──────

export function getReadinessList(): DonorReadiness[] {
  return getDonors()
    .filter((d) => d.readinessAvailable)
    .map((d) => ({
      id: `READY-${d.id}`,
      donorId: d.id,
      donorName: `${d.firstName} ${d.lastName}`,
      bloodType: d.bloodType,
      city: d.city,
      available: d.readinessAvailable,
      readinessDate: d.readinessDate || "",
    }));
}

export function getReadinessByDonor(donorId: string): DonorReadiness | null {
  const d = getDonorById(donorId);
  if (!d || !d.readinessAvailable) return null;
  return {
    id: `READY-${d.id}`,
    donorId: d.id,
    donorName: `${d.firstName} ${d.lastName}`,
    bloodType: d.bloodType,
    city: d.city,
    available: d.readinessAvailable,
    readinessDate: d.readinessDate || "",
  };
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
  dbSetReadiness(data.donorId, data.available);
}

export function removeDonorReadiness(donorId: string): void {
  dbSetReadiness(donorId, false);
}
