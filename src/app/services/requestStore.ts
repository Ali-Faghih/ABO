import { api } from "./api";
import type { BloodRequest, DonorReadiness } from "../types";
import { canDonateTo } from "../lib/bloodCompatibility";

export async function getRequests(): Promise<BloodRequest[]> {
  return api<BloodRequest[]>("GET", "/requests");
}

export async function getActiveRequests(): Promise<BloodRequest[]> {
  return api<BloodRequest[]>("GET", "/requests/active");
}

export async function getRequestById(id: string): Promise<BloodRequest | null> {
  try {
    return await api<BloodRequest>("GET", `/requests/${id}`);
  } catch {
    return null;
  }
}

export async function getRequestsByHospital(hospitalId: string): Promise<BloodRequest[]> {
  return api<BloodRequest[]>("GET", `/requests/hospital/${hospitalId}`);
}

export async function addRequest(req: BloodRequest): Promise<boolean> {
  try {
    await api("POST", "/requests", req);
    return true;
  } catch {
    return false;
  }
}

export async function updateRequest(id: string, updates: Partial<BloodRequest>): Promise<boolean> {
  try {
    await api("PUT", `/requests/${id}`, updates);
    return true;
  } catch {
    return false;
  }
}

export async function cancelRequest(id: string): Promise<boolean> {
  try {
    await api("DELETE", `/requests/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function getReadinessList(): Promise<DonorReadiness[]> {
  const donors = await api<any[]>("GET", "/donors/available/list");
  return donors.map((d) => ({
    id: `READY-${d.userId}`,
    donorId: d.userId,
    donorName: `${d.firstName} ${d.lastName}`,
    bloodType: d.bloodType,
    city: d.city,
    available: !!d.readinessAvailable,
    readinessDate: d.readinessDate || "",
  }));
}

export async function getReadinessByDonor(donorId: string): Promise<DonorReadiness | null> {
  try {
    const d = await api<any>("GET", `/donors/${donorId}`);
    if (!d.readinessAvailable) return null;
    return {
      id: `READY-${d.userId}`,
      donorId: d.userId,
      donorName: `${d.firstName} ${d.lastName}`,
      bloodType: d.bloodType,
      city: d.city,
      available: true,
      readinessDate: d.readinessDate || "",
    };
  } catch {
    return null;
  }
}

export async function getAvailableDonors(bloodType?: string, city?: string): Promise<DonorReadiness[]> {
  const donors = await getReadinessList();
  return donors.filter((r) => {
    if (!r.available) return false;
    if (bloodType && !canDonateTo(r.bloodType, bloodType)) return false;
    if (city && r.city !== city) return false;
    return true;
  });
}

export async function setDonorReadiness(data: DonorReadiness): Promise<void> {
  await api("PUT", `/donors/${data.donorId}/readiness`, { available: data.available });
}

export async function removeDonorReadiness(donorId: string): Promise<void> {
  await api("PUT", `/donors/${donorId}/readiness`, { available: false });
}
