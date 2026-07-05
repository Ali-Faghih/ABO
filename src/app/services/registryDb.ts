import { api } from "./api";
import type { RegistryDonor, RegistryHospital } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
//  Creative ID Generators (pure functions, kept for registration verifications)
// ═══════════════════════════════════════════════════════════════════════════

function letterGroup(ch: string): number {
  if ("اآعغ".includes(ch)) return 0;
  if ("بپف".includes(ch)) return 1;
  if ("تثسص".includes(ch)) return 2;
  if ("جچقکگ".includes(ch)) return 3;
  if ("حخه".includes(ch)) return 4;
  if ("دذضظ".includes(ch)) return 5;
  if ("رزژ".includes(ch)) return 6;
  if ("شویئ".includes(ch)) return 7;
  if ("طلم".includes(ch)) return 8;
  if ("ننک".includes(ch)) return 9;
  return 0;
}

function nameFingerprint(s: string): number {
  return s.split("").reduce((sum, ch) => sum + letterGroup(ch), 0) % 100;
}

function luhnCheck(digits: string): string {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[i], 10);
    const w = (digits.length - i) % 2 === 1 ? 1 : 2;
    const p = d * w;
    sum += p > 9 ? p - 9 : p;
  }
  return ((10 - (sum % 10)) % 10).toString();
}

function creativeNationalId(idx: number, firstName: string, lastName: string, birthYear: string, _gender: "male" | "female"): string {
  const fn = nameFingerprint(firstName);
  const ln = nameFingerprint(lastName);
  const yr = parseInt(birthYear.slice(-2), 10);
  const scrambled = (idx * 127 + 59) % 1000;
  const parts = [
    Math.floor(fn / 10) % 10, fn % 10,
    Math.floor(ln / 10) % 10, ln % 10,
    Math.floor(yr / 10), yr % 10,
    Math.floor(scrambled / 100),
    Math.floor((scrambled % 100) / 10),
    scrambled % 10,
  ];
  return parts.join("") + luhnCheck(parts.join(""));
}

function creativeHospitalId(name: string, city: string, type: string): string {
  const CITY_CODE: Record<string, string> = {
    تهران: "TE", شیراز: "SH", اصفهان: "ES", مشهد: "MH", تبریز: "TB",
    کاشان: "KA", نجف‌آباد: "NJ", خمینی‌شهر: "KH", شاهین‌شهر: "SN",
  };
  const TYPE_CODE: Record<string, string> = {
    بیمارستان: "H", "بیمارستان تخصصی": "S", "مرکز اهدای خون": "D",
  };
  const cc = CITY_CODE[city] || "XX";
  const tc = TYPE_CODE[type] || "H";
  let hash = 5381;
  for (const ch of name) {
    hash = ((hash << 5) + hash + ch.charCodeAt(0)) | 0;
  }
  const hex = ((Math.abs(hash) % 0x10000) >>> 0).toString(16).toUpperCase().padStart(4, "0");
  return `${cc}${tc}-${hex}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Seed Data Generators (for initialization/verification only)
// ═══════════════════════════════════════════════════════════════════════════

const MALE_NAMES = [
  "علی","محمد","امیر","حسن","حسین","رضا","مهدی","احمد","سعید","مصطفی",
  "کاوه","بابک","شهرام","بهرام","نادر","فرهاد","کامران","داریوش","آرش","امید",
  "سامان","کیوان","مهرداد","وحید","حمید","میثم","جواد","پیمان","فرشاد","بهنام",
  "رسول","منصور","جمشید","مجید","سجاد","میلاد","حامد","ایمان","افشین","جهانگیر",
  "ایرج","تورج","شاپور","بهمن","کوروش","داوود","صادق","نقی","تقی","اکبر",
];
const FEMALE_NAMES = [
  "فاطمه","زهرا","مریم","نرگس","سارا","زینب","لیلا","مهناز","شهرزاد","پریسا",
  "الهام","ناهید","هنگامه","شیرین","مهسا","یاسمن","نازنین","بهناز","سمانه","راحله",
  "مینا","شیما","رؤیا","سحر","مژگان","فرشته","سودابه","مرجان","آرزو","گیتی",
  "پروین","شهلا","فروغ","فریده","فریبا","لیلی","عاطفه","نسترن","سپیده","بهاره",
  "غزل","سوسن","ژیلا","شقایق","نیلوفر","پرستو","باران","بهار","نیکا","ترانه",
];
const LAST_NAMES = [
  "محمدی","حسینی","رضایی","احمدی","کریمی","موسوی","جعفری","عباسی","قاسمی","سلیمانی",
  "اکبری","صادقی","میرزایی","نوری","کاظمی","حیدری","شریفی","رحیمی","ابراهیمی","طاهری",
  "فرجی","صالحی","مرادی","رستمی","نادری","صمدی","تقوی","حسنی","مظفری","جهانگیری",
  "حکیمی","عابدی","عسگری","بهرامی","اسدی","داوودی","زارعی","غلامی","نظری","وکیلی",
  "فتاحی","محمودی","خلیلی","صنعتی","یوسفی","کاشانی","نجفی","طباطبایی","مقدم","پوراحمد",
];

export function getDemoHospitalIds(): string[] {
  const HOSPITAL_DATA: [string, string, string][] = [
    ["بیمارستان امام خمینی","تهران","بیمارستان"],
    ["بیمارستان شریعتی","تهران","بیمارستان"],
    ["بیمارستان سینا","تهران","بیمارستان"],
    ["بیمارستان رسول اکرم","تهران","بیمارستان"],
    ["بیمارستان فیروزگر","تهران","بیمارستان"],
  ];
  return HOSPITAL_DATA.map(([name, city, type]) => creativeHospitalId(name, city, type));
}

export function getDemoDonorNationalIds(): { nationalId: string; firstName: string; lastName: string; birthDate: string; phone: string }[] {
  return [{ firstName: "علی", lastName: "محمدی", birthDate: "۱۳۶۵/۰۲/۱۴", phone: "091212301000" },
    { firstName: "محمد", lastName: "حسینی", birthDate: "۱۳۷۰/۰۶/۲۱", phone: "091212301001" },
    { firstName: "امیر", lastName: "رضایی", birthDate: "۱۳۶۰/۱۱/۰۳", phone: "091212301002" },
  ].map((d, i) => ({
    ...d,
    nationalId: creativeNationalId(i, d.firstName, d.lastName, d.birthDate.split("/")[0], "male"),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
//  Registry CRUD (via API)
// ═══════════════════════════════════════════════════════════════════════════

export async function getRegistryDonors(): Promise<RegistryDonor[]> {
  return api<RegistryDonor[]>("GET", "/registry/donors");
}

export async function getRegistryHospitals(): Promise<RegistryHospital[]> {
  return api<RegistryHospital[]>("GET", "/registry/hospitals");
}

export async function findDonorInRegistry(nationalId: string, birthDate?: string): Promise<RegistryDonor | null> {
  try {
    return await api<RegistryDonor>("GET", `/registry/donors/${encodeURIComponent(nationalId)}`);
  } catch {
    return null;
  }
}

export async function findHospitalInRegistry(hospitalId: string): Promise<RegistryHospital | null> {
  try {
    return await api<RegistryHospital>("GET", `/registry/hospitals/${encodeURIComponent(hospitalId)}`);
  } catch {
    return null;
  }
}

export async function addRegistryDonor(donor: RegistryDonor): Promise<boolean> {
  try {
    await api("POST", "/registry/donors", donor);
    return true;
  } catch {
    return false;
  }
}

export async function updateRegistryDonor(nationalId: string, donor: RegistryDonor): Promise<boolean> {
  try {
    await api("PUT", `/registry/donors/${encodeURIComponent(nationalId)}`, donor);
    return true;
  } catch {
    return false;
  }
}

export async function deleteRegistryDonor(nationalId: string): Promise<boolean> {
  try {
    await api("DELETE", `/registry/donors/${encodeURIComponent(nationalId)}`);
    return true;
  } catch {
    return false;
  }
}

export async function addRegistryHospital(hospital: RegistryHospital): Promise<boolean> {
  try {
    await api("POST", "/registry/hospitals", hospital);
    return true;
  } catch {
    return false;
  }
}

export async function updateRegistryHospital(hospitalId: string, hospital: RegistryHospital): Promise<boolean> {
  try {
    await api("PUT", `/registry/hospitals/${encodeURIComponent(hospitalId)}`, hospital);
    return true;
  } catch {
    return false;
  }
}

export async function deleteRegistryHospital(hospitalId: string): Promise<boolean> {
  try {
    await api("DELETE", `/registry/hospitals/${encodeURIComponent(hospitalId)}`);
    return true;
  } catch {
    return false;
  }
}

export async function resetRegistry(): Promise<void> {
  // Registry data is managed server-side; reset isn't exposed via API
}
