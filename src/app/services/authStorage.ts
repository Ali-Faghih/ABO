import type { UserProfile, HospitalProfile, DonorProfile, DonorRegistrationData, HospitalRegistrationData } from "../types";
import { getDonorByNationalId, findDonorUser, donorUsernameExists, addDonor, getDonorById, getDonors, updateDonor } from "../db/donors";
import { getHospitalByHospitalId, findHospitalUser, hospitalUsernameExists, addHospital, getHospitalById, getHospitals, updateHospital } from "../db/hospitals";

const SESSION_KEY = "abo_session";

function donorToProfile(d: import("../db/donors").DbDonor): DonorProfile {
  return {
    type: "donor",
    id: d.id,
    username: d.nationalId,
    password: d.password,
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
    eligible: d.eligible,
    nextEligible: d.nextEligible || undefined,
    lastDonation: d.lastDonation || undefined,
    joinDate: d.joinDate,
    donations: d.donations,
    gender: d.gender,
    diseaseName: d.diseaseName || undefined,
    medicationName: d.medicationName || undefined,
  };
}

function hospitalToProfile(h: import("../db/hospitals").DbHospital): HospitalProfile {
  return {
    type: "hospital",
    id: h.id,
    username: h.hospitalId,
    password: h.password,
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
    activeRequests: h.activeRequests,
    totalDonors: h.totalDonors,
    totalDonations: h.totalDonations,
    rating: h.rating,
    beds: h.beds || undefined,
    founded: h.founded || undefined,
  };
}

export function findUser(username: string, password: string, type: UserProfile["type"]): UserProfile | null {
  if (type === "donor") {
    const d = findDonorUser(username, password);
    return d ? donorToProfile(d) : null;
  }
  const h = findHospitalUser(username, password);
  return h ? hospitalToProfile(h) : null;
}

export function saveUser(user: UserProfile): void {
  if (user.type === "donor") {
    const existing = getDonorById(user.id);
    if (existing) {
      updateDonor(user.id, {
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        province: user.province,
        address: user.address,
        weight: user.weight || 0,
        height: user.height || 0,
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
      const d = {
        id: user.id,
        nationalId: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        birthDate: "",
        gender: user.gender,
        city: user.city,
        province: user.province,
        address: user.address,
        weight: user.weight || 0,
        height: user.height || 0,
        bloodType: user.bloodType,
        diseaseName: user.diseaseName || "",
        medicationName: user.medicationName || "",
        readinessAvailable: false,
        readinessDate: null,
        eligible: user.eligible,
        nextEligible: user.nextEligible || null,
        lastDonation: user.lastDonation || null,
        joinDate: user.joinDate,
        donations: user.donations,
        notifications: [],
      };
      addDonor({ nationalId: d.nationalId, phone: d.phone, firstName: d.firstName, lastName: d.lastName, province: d.province, city: d.city, address: d.address, bloodType: d.bloodType, weight: d.weight, height: d.height, gender: d.gender, password: d.password }, user.id);
    }
  } else {
    const existing = getHospitalById(user.id);
    if (existing) {
      updateHospital(user.id, {
        password: user.password,
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
}

export function getAllUsers(): UserProfile[] {
  const donors = getDonors().map(donorToProfile);
  const hospitals = getHospitals().map(hospitalToProfile);
  return [...hospitals, ...donors];
}

export function findUserByUsername(username: string): UserProfile | null {
  const d = getDonorByNationalId(username);
  if (d) return donorToProfile(d);
  const h = getHospitalByHospitalId(username);
  if (h) return hospitalToProfile(h);
  return null;
}

export function usernameExists(username: string): boolean {
  return donorUsernameExists(username) || hospitalUsernameExists(username);
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
  const d = getDonorById(id);
  if (d) return donorToProfile(d);
  const h = getHospitalById(id);
  if (h) return hospitalToProfile(h);
  return null;
}

export function registerDonor(data: DonorRegistrationData): { success: boolean; error?: string } {
  if (donorUsernameExists(data.nationalId)) return { success: false, error: "این کد ملی قبلاً ثبت نام کرده است" };
  const id = crypto.randomUUID?.() ?? `donor-${Date.now()}-${Math.random()}`;
  const donor = addDonor(data, id);
  if (!donor) return { success: false, error: "خطا در ثبت نام" };
  return { success: true };
}

export function registerHospital(data: HospitalRegistrationData): { success: boolean; error?: string } {
  if (hospitalUsernameExists(data.hospitalId)) return { success: false, error: "این بیمارستان قبلاً ثبت نام کرده است" };
  const id = crypto.randomUUID?.() ?? `hosp-${Date.now()}-${Math.random()}`;
  const hospital = addHospital(data, id);
  if (!hospital) return { success: false, error: "خطا در ثبت نام" };
  return { success: true };
}
