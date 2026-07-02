import type { RegistryDonor, RegistryHospital } from "../types";

const REGISTRY_KEY = "abo_registry";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_DONORS: RegistryDonor[] = [
  { nationalId: "0012345678", firstName: "علی", lastName: "محمدی", birthDate: "1370/02/15", phone: "09121111222", gender: "male" },
  { nationalId: "0012345679", firstName: "سارا", lastName: "حسینی", birthDate: "1375/06/20", phone: "09132223333", gender: "female" },
  { nationalId: "0012345680", firstName: "محمد", lastName: "رضایی", birthDate: "1368/11/08", phone: "09143334444", gender: "male" },
  { nationalId: "0012345681", firstName: "فاطمه", lastName: "احمدی", birthDate: "1380/04/12", phone: "09354445555", gender: "female" },
  { nationalId: "0012345682", firstName: "امیر", lastName: "کریمی", birthDate: "1372/09/30", phone: "09155556666", gender: "male" },
  { nationalId: "0012345683", firstName: "زهرا", lastName: "موسوی", birthDate: "1378/01/25", phone: "09366667777", gender: "female" },
  { nationalId: "0012345684", firstName: "حسن", lastName: "جعفری", birthDate: "1365/07/18", phone: "09177778888", gender: "male" },
  { nationalId: "0012345685", firstName: "مریم", lastName: "عباسی", birthDate: "1374/03/05", phone: "09388889999", gender: "female" },
  { nationalId: "0012345686", firstName: "رضا", lastName: "قاسمی", birthDate: "1369/12/14", phone: "09199990000", gender: "male" },
  { nationalId: "0012345687", firstName: "نرگس", lastName: "سلیمانی", birthDate: "1376/08/22", phone: "09300001111", gender: "female" },
];

const SEED_HOSPITALS: RegistryHospital[] = [
  { hospitalId: "HOSP-001", name: "بیمارستان امام خمینی", type: "دولتی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1001-1401", address: "خیابان ولیعصر، تهران" },
  { hospitalId: "HOSP-002", name: "بیمارستان شریعتی", type: "دانشگاهی - آموزشی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1002-1401", address: "خیابان کارگر شمالی، تهران" },
  { hospitalId: "HOSP-003", name: "بیمارستان مهراد", type: "خصوصی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1003-1401", address: "بلوار میرداماد، تهران" },
  { hospitalId: "HOSP-004", name: "سازمان انتقال خون", type: "دولتی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1004-1400", address: "خیابان سهروردی شمالی، تهران" },
  { hospitalId: "HOSP-005", name: "بیمارستان توس", type: "خصوصی", city: "مشهد", province: "خراسان رضوی", licenseNumber: "IR-MOH-2001-1401", address: "بلوار توس، مشهد" },
  { hospitalId: "HOSP-006", name: "بیمارستان فیروزگر", type: "تأمین اجتماعی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1005-1402", address: "خیابان انقلاب اسلامی، تهران" },
  { hospitalId: "HOSP-007", name: "بیمارستان میلاد", type: "خصوصی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1006-1401", address: "بلوار کشاورز، تهران" },
  { hospitalId: "HOSP-008", name: "بیمارستان بوعلی", type: "دانشگاهی - آموزشی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1007-1400", address: "خیابان شریعتی، تهران" },
  { hospitalId: "HOSP-009", name: "بیمارستان پارس", type: "خصوصی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1008-1402", address: "بلوار فردوس، تهران" },
  { hospitalId: "HOSP-010", name: "بیمارستان رسول اکرم", type: "دولتی", city: "تهران", province: "تهران", licenseNumber: "IR-MOH-1009-1401", address: "خیابان نیایش، تهران" },
];

// ─── Init / Read / Write ──────────────────────────────────────────────────────

function initRegistry(): void {
  const exists = localStorage.getItem(REGISTRY_KEY);
  if (!exists) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify({ donors: SEED_DONORS, hospitals: SEED_HOSPITALS }));
  }
}

function readRegistry(): { donors: RegistryDonor[]; hospitals: RegistryHospital[] } {
  initRegistry();
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) || "{}");
  } catch {
    return { donors: SEED_DONORS, hospitals: SEED_HOSPITALS };
  }
}

function writeRegistry(data: { donors: RegistryDonor[]; hospitals: RegistryHospital[] }): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(data));
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

function toWesternDigits(str: string): string {
  const persian: Record<string, string> = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9" };
  return str.replace(/[۰-۹]/g, (ch) => persian[ch] || ch);
}

export function findDonorInRegistry(nationalId: string, birthDate?: string): RegistryDonor | null {
  const { donors } = readRegistry();
  const normalizedNationalId = toWesternDigits(nationalId.trim());
  const normalizedInputBirth = birthDate ? toWesternDigits(birthDate) : undefined;
  return donors.find((d) => {
    if (toWesternDigits(d.nationalId) !== normalizedNationalId) return false;
    if (normalizedInputBirth) {
      return toWesternDigits(d.birthDate || "") === normalizedInputBirth;
    }
    return true;
  }) ?? null;
}

export function findHospitalInRegistry(hospitalId: string): RegistryHospital | null {
  const { hospitals } = readRegistry();
  return hospitals.find((h) => h.hospitalId === hospitalId.trim()) ?? null;
}

// ─── CRUD Donors ──────────────────────────────────────────────────────────────

export function getRegistryDonors(): RegistryDonor[] {
  return readRegistry().donors;
}

export function addRegistryDonor(donor: RegistryDonor): boolean {
  const data = readRegistry();
  if (data.donors.some((d) => d.nationalId === donor.nationalId)) return false;
  data.donors.push(donor);
  writeRegistry(data);
  return true;
}

export function updateRegistryDonor(nationalId: string, donor: RegistryDonor): boolean {
  const data = readRegistry();
  const idx = data.donors.findIndex((d) => d.nationalId === nationalId);
  if (idx < 0) return false;
  data.donors[idx] = donor;
  writeRegistry(data);
  return true;
}

export function deleteRegistryDonor(nationalId: string): boolean {
  const data = readRegistry();
  const idx = data.donors.findIndex((d) => d.nationalId === nationalId);
  if (idx < 0) return false;
  data.donors.splice(idx, 1);
  writeRegistry(data);
  return true;
}

// ─── CRUD Hospitals ───────────────────────────────────────────────────────────

export function getRegistryHospitals(): RegistryHospital[] {
  return readRegistry().hospitals;
}

export function addRegistryHospital(hospital: RegistryHospital): boolean {
  const data = readRegistry();
  if (data.hospitals.some((h) => h.hospitalId === hospital.hospitalId)) return false;
  data.hospitals.push(hospital);
  writeRegistry(data);
  return true;
}

export function updateRegistryHospital(hospitalId: string, hospital: RegistryHospital): boolean {
  const data = readRegistry();
  const idx = data.hospitals.findIndex((h) => h.hospitalId === hospitalId);
  if (idx < 0) return false;
  data.hospitals[idx] = hospital;
  writeRegistry(data);
  return true;
}

export function deleteRegistryHospital(hospitalId: string): boolean {
  const data = readRegistry();
  const idx = data.hospitals.findIndex((h) => h.hospitalId === hospitalId);
  if (idx < 0) return false;
  data.hospitals.splice(idx, 1);
  writeRegistry(data);
  return true;
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export function resetRegistry(): void {
  localStorage.removeItem(REGISTRY_KEY);
  initRegistry();
}
