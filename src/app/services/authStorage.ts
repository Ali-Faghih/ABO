import { api, getToken, setToken, clearToken, getSessionUserId, setSession, clearSession } from "./api";
import type { UserProfile, DonorProfile, HospitalProfile, DonorRegistrationData, HospitalRegistrationData } from "../types";

const PASSWORD_KEY = "abo_pw";

export { getSessionUserId, setSession, clearSession };

function donorApiToProfile(d: any, username: string, password: string): DonorProfile {
  return {
    type: "donor",
    id: d.userId,
    username,
    password,
    name: `${d.firstName} ${d.lastName}`,
    firstName: d.firstName,
    lastName: d.lastName,
    bloodType: d.bloodType,
    city: d.city,
    province: d.province,
    phone: d.phone,
    address: d.address,
    weight: d.weight || undefined,
    height: d.height || undefined,
    eligible: !!d.eligible,
    nextEligible: d.nextEligible || undefined,
    lastDonation: d.lastDonation || undefined,
    joinDate: d.joinDate,
    donations: d.donations || 0,
    gender: d.gender || "male",
    diseaseName: d.diseaseName || undefined,
    medicationName: d.medicationName || undefined,
  };
}

function hospitalApiToProfile(h: any, username: string, password: string): HospitalProfile {
  return {
    type: "hospital",
    id: h.userId,
    username,
    password,
    name: h.name,
    hospitalType: h.hospitalType,
    city: h.city,
    province: h.province,
    address: h.address,
    phone: h.phone,
    licenseNumber: h.licenseNumber,
    managerFirstName: h.managerFirstName,
    managerLastName: h.managerLastName,
    managerNationalId: h.managerNationalId,
    managerPosition: h.managerPosition,
    managerPhone: h.managerPhone,
    activeRequests: h.activeRequests || 0,
    totalDonors: h.totalDonors || 0,
    totalDonations: h.totalDonations || 0,
    rating: h.rating || 0,
    beds: h.beds || undefined,
    founded: h.founded || undefined,
  };
}

export async function findUser(username: string, password: string, type: UserProfile["type"]): Promise<UserProfile | null> {
  try {
    const { token, userId } = await api<{ token: string; userId: string; type: string }>("POST", "/auth/login", { username, password, type });
    setToken(token);
    setSession(userId);
    localStorage.setItem(PASSWORD_KEY, password);
    if (type === "donor") {
      const d = await api<any>("GET", `/donors/${userId}`);
      return donorApiToProfile(d, username, password);
    }
    const h = await api<any>("GET", `/hospitals/${userId}`);
    return hospitalApiToProfile(h, username, password);
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  try {
    const pw = localStorage.getItem(PASSWORD_KEY) || "";
    const d = await api<any>("GET", `/donors/${id}`).catch(() => null);
    if (d) return donorApiToProfile(d, d.username || "", pw);
    const h = await api<any>("GET", `/hospitals/${id}`).catch(() => null);
    if (h) return hospitalApiToProfile(h, h.username || "", pw);
    return null;
  } catch {
    return null;
  }
}

export async function saveUser(user: UserProfile): Promise<void> {
  if (user.type === "donor") {
    await api("PUT", `/donors/${user.id}`, {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      city: user.city,
      province: user.province,
      address: user.address,
      weight: user.weight,
      height: user.height,
      bloodType: user.bloodType,
      eligible: user.eligible,
      nextEligible: user.nextEligible || null,
      lastDonation: user.lastDonation || null,
      donations: user.donations,
      gender: user.gender,
      diseaseName: user.diseaseName || "",
      medicationName: user.medicationName || "",
    });
  } else {
    await api("PUT", `/hospitals/${user.id}`, {
      name: user.name,
      hospitalType: user.hospitalType,
      city: user.city,
      province: user.province,
      address: user.address,
      phone: user.phone,
      licenseNumber: user.licenseNumber,
      managerFirstName: user.managerFirstName,
      managerLastName: user.managerLastName,
      managerNationalId: user.managerNationalId,
      managerPosition: user.managerPosition,
      managerPhone: user.managerPhone,
      activeRequests: user.activeRequests,
      totalDonors: user.totalDonors,
      totalDonations: user.totalDonations,
      rating: user.rating,
      beds: user.beds || 0,
      founded: user.founded || "",
    });
  }
}

export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const { exists, userId, type } = await api<{ exists: boolean; userId: string; type: string }>("GET", `/auth/check/${encodeURIComponent(username)}`);
    if (!exists) return null;
    return getUserById(userId);
  } catch {
    return null;
  }
}

export async function usernameExists(username: string): Promise<boolean> {
  try {
    const { exists } = await api<{ exists: boolean }>("GET", `/auth/check/${encodeURIComponent(username)}`);
    return exists;
  } catch {
    return false;
  }
}

export function getAllUsers(): UserProfile[] {
  return [];
}

export async function registerDonor(data: DonorRegistrationData): Promise<{ success: boolean; error?: string }> {
  try {
    await api("POST", "/auth/register/donor", data);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "خطا در ثبت نام" };
  }
}

export async function registerHospital(data: HospitalRegistrationData): Promise<{ success: boolean; error?: string }> {
  try {
    await api("POST", "/auth/register/hospital", data);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "خطا در ثبت نام" };
  }
}
