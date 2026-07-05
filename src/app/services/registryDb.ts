import type { RegistryDonor, RegistryHospital } from "../types";

const REGISTRY_KEY = "abo_registry";

// ═══════════════════════════════════════════════════════════════════════════
//  Creative National ID Generator
//  ─────────────────────────────────────
//  هر کد ملی ۱۰ رقمی با الگوریتم ترکیبی تولید می‌شود:
//    ارقام ۱-۲ : اثر انگشت نام (جمع گروه حروف نام / ۱۰۰)
//    ارقام ۳-۴ : اثر انگشت نام‌خانوادگی
//    ارقام ۵-۶ : دو رقم آخر سال تولد
//    ارقام ۷-۹ : اندیس پیموده‌شده (شماره × ۱۲۷ + ۵۹ مد ۱۰۰۰)
//    رقم ۱۰   : رقم کنترل لوهن روی ۹ رقم اول
//  الگوریتم از اعداد اول مرسن (۱۲۷) برای درهم‌سازی غیرخطی استفاده می‌کند
// ═══════════════════════════════════════════════════════════════════════════

/** گروه‌بندی حروف فارسی بر اساس شباهت آوایی/نگارشی (هر حرف → یک گروه ۰-۹) */
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

/** مجموع کد گروه حروف یک کلمه (مد ۱۰۰) */
function nameFingerprint(s: string): number {
  return s.split("").reduce((sum, ch) => sum + letterGroup(ch), 0) % 100;
}

/** رقم کنترل لوهن (Luhn mod-10) */
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

function creativeNationalId(
  idx: number,
  firstName: string,
  lastName: string,
  birthYear: string,
  _gender: "male" | "female"
): string {
  const fn = nameFingerprint(firstName);
  const ln = nameFingerprint(lastName);
  const yr = parseInt(birthYear.slice(-2), 10);
  const scrambled = (idx * 127 + 59) % 1000;
  const parts = [
    Math.floor(fn / 10) % 10,
    fn % 10,
    Math.floor(ln / 10) % 10,
    ln % 10,
    Math.floor(yr / 10),
    yr % 10,
    Math.floor(scrambled / 100),
    Math.floor((scrambled % 100) / 10),
    scrambled % 10,
  ];
  return parts.join("") + luhnCheck(parts.join(""));
}

// ═══════════════════════════════════════════════════════════════════════════
//  Creative Hospital ID Generator
//  ─────────────────────────────────
//  فرمت: {کد شهر}{کد نوع}-{چهار رقم هگز姓名هش}
//    کد شهر    : ۲ حرف (TE, SH, ES, MH, TB, …)
//    کد نوع    : ۱ حرف (H=بیمارستان, S=تخصصی, D=مرکز اهدا)
//    ۴ رقم هگز : درهم‌سازی DJB2 از نام مرکز → ۴ رقم پایه ۱۶
// ═══════════════════════════════════════════════════════════════════════════

const CITY_CODE: Record<string, string> = {
  تهران: "TE", شیراز: "SH", اصفهان: "ES", مشهد: "MH", تبریز: "TB",
  کاشان: "KA", نجف‌آباد: "NJ", خمینی‌شهر: "KH", شاهین‌شهر: "SN",
};

const TYPE_CODE: Record<string, string> = {
  بیمارستان: "H", "بیمارستان تخصصی": "S", "مرکز اهدای خون": "D",
};

function creativeHospitalId(name: string, city: string, type: string): string {
  const cc = CITY_CODE[city] || "XX";
  const tc = TYPE_CODE[type] || "X";
  let hash = 5381;
  for (const ch of name) {
    hash = ((hash << 5) + hash + ch.charCodeAt(0)) | 0;
  }
  const hex = ((Math.abs(hash) % 0x10000) >>> 0)
    .toString(16).toUpperCase().padStart(4, "0");
  return `${cc}${tc}-${hex}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Seed Data — 100 Donors
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

function generateDonors(): RegistryDonor[] {
  const donors: RegistryDonor[] = [];
  let idx = 0;

  for (let i = 0; i < 50; i++) {
    const firstName = MALE_NAMES[i];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const year = 1345 + ((i * 37 + 17) % 40);
    const month = 1 + ((i * 13 + 5) % 12);
    const day = 1 + ((i * 7 + 3) % 28);
    const birthDate = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    const phone = `09121230${String(1000 + i).slice(1)}`;
    const nationalId = creativeNationalId(idx, firstName, lastName, String(year), "male");
    donors.push({ nationalId, firstName, lastName, birthDate, phone, gender: "male" });
    idx++;
  }

  for (let i = 0; i < 50; i++) {
    const firstName = FEMALE_NAMES[i];
    const lastName = LAST_NAMES[(50 + i) % LAST_NAMES.length];
    const year = 1350 + ((i * 29 + 13) % 36);
    const month = 1 + ((i * 11 + 7) % 12);
    const day = 1 + ((i * 5 + 11) % 28);
    const birthDate = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    const phone = `09391231${String(1000 + i).slice(1)}`;
    const nationalId = creativeNationalId(idx, firstName, lastName, String(year), "female");
    donors.push({ nationalId, firstName, lastName, birthDate, phone, gender: "female" });
    idx++;
  }

  return donors;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Seed Data — Hospitals (exact list from user: TE=30, ES=20, MH=20, SH=15, TB=10)
// ═══════════════════════════════════════════════════════════════════════════

const HOSPITAL_DATA: [string, string, string, string][] = [
  // ── Tehran (30) ──────────────────────────────────────────────────────────
  ["بیمارستان امام خمینی",                "تهران", "بیمارستان",          ""],
  ["بیمارستان شریعتی",                    "تهران", "بیمارستان",          ""],
  ["بیمارستان سینا",                      "تهران", "بیمارستان",          ""],
  ["بیمارستان رسول اکرم",                 "تهران", "بیمارستان",          ""],
  ["بیمارستان فیروزگر",                   "تهران", "بیمارستان",          ""],
  ["بیمارستان شهدای تجریش",               "تهران", "بیمارستان",          ""],
  ["بیمارستان لقمان حکیم",                "تهران", "بیمارستان",          ""],
  ["بیمارستان بهارلو",                    "تهران", "بیمارستان",          ""],
  ["بیمارستان طرفه",                      "تهران", "بیمارستان",          ""],
  ["بیمارستان هفتم تیر",                  "تهران", "بیمارستان",          ""],
  ["بیمارستان قلب شهید رجایی",            "تهران", "بیمارستان تخصصی",    ""],
  ["بیمارستان مسیح دانشوری",              "تهران", "بیمارستان",          ""],
  ["بیمارستان کودکان مفید",               "تهران", "بیمارستان",          ""],
  ["بیمارستان حضرت علی‌اصغر",             "تهران", "بیمارستان",          ""],
  ["بیمارستان اکبرآبادی",                 "تهران", "بیمارستان",          ""],
  ["بیمارستان یاس",                       "تهران", "بیمارستان",          ""],
  ["بیمارستان ضیائیان",                   "تهران", "بیمارستان",          ""],
  ["بیمارستان عرفان نیایش",               "تهران", "بیمارستان",          ""],
  ["بیمارستان پارس",                      "تهران", "بیمارستان",          ""],
  ["بیمارستان مهر",                       "تهران", "بیمارستان",          ""],
  ["بیمارستان دی",                        "تهران", "بیمارستان",          ""],
  ["بیمارستان آتیه",                      "تهران", "بیمارستان",          ""],
  ["بیمارستان خاتم الانبیاء",             "تهران", "بیمارستان",          ""],
  ["بیمارستان خاتم‌الانبیا (نیروی انتظامی)", "تهران", "بیمارستان",      ""],
  ["بیمارستان میلاد",                     "تهران", "بیمارستان",          ""],
  ["مرکز اهدای خون وصال",                 "تهران", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون ستاری",                "تهران", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون تهرانپارس",            "تهران", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون شهرری",                "تهران", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون پیروزی",               "تهران", "مرکز اهدای خون",     ""],
  // ── Isfahan (20) ─────────────────────────────────────────────────────────
  ["بیمارستان الزهرا",                    "اصفهان", "بیمارستان",         ""],
  ["بیمارستان خورشید",                    "اصفهان", "بیمارستان",         ""],
  ["بیمارستان امین",                      "اصفهان", "بیمارستان",         ""],
  ["بیمارستان سیدالشهدا",                 "اصفهان", "بیمارستان",         ""],
  ["بیمارستان عیسی بن مریم",              "اصفهان", "بیمارستان",         ""],
  ["بیمارستان کاشانی",                    "اصفهان", "بیمارستان",         ""],
  ["بیمارستان غرضی",                      "اصفهان", "بیمارستان",         ""],
  ["بیمارستان سینا",                      "اصفهان", "بیمارستان",         ""],
  ["بیمارستان شهید چمران",                "اصفهان", "بیمارستان",         ""],
  ["بیمارستان خانواده",                   "اصفهان", "بیمارستان",         ""],
  ["بیمارستان میلاد",                     "اصفهان", "بیمارستان",         ""],
  ["بیمارستان سعدی",                      "اصفهان", "بیمارستان",         ""],
  ["بیمارستان بهشتی",                     "کاشان", "بیمارستان",          ""],
  ["بیمارستان متینی",                     "کاشان", "بیمارستان",          ""],
  ["بیمارستان شهید محمد منتظری",          "نجف‌آباد", "بیمارستان",       ""],
  ["مرکز اهدای خون خواجو",                "اصفهان", "مرکز اهدای خون",    ""],
  ["مرکز اهدای خون شریعتی",               "اصفهان", "مرکز اهدای خون",    ""],
  ["مرکز اهدای خون عاشق اصفهانی",         "اصفهان", "مرکز اهدای خون",    ""],
  ["مرکز اهدای خون خمینی‌شهر",            "خمینی‌شهر", "مرکز اهدای خون", ""],
  ["مرکز اهدای خون شاهین‌شهر",            "شاهین‌شهر", "مرکز اهدای خون", ""],
  // ── Mashhad (20) ─────────────────────────────────────────────────────────
  ["بیمارستان امام رضا",                  "مشهد", "بیمارستان",           ""],
  ["بیمارستان قائم",                      "مشهد", "بیمارستان",           ""],
  ["بیمارستان دکتر شریعتی",               "مشهد", "بیمارستان",           ""],
  ["بیمارستان هاشمی‌نژاد",                "مشهد", "بیمارستان",           ""],
  ["بیمارستان ابن‌سینا",                  "مشهد", "بیمارستان",           ""],
  ["بیمارستان اکبر",                      "مشهد", "بیمارستان",           ""],
  ["بیمارستان امدادی شهید کامیاب",        "مشهد", "بیمارستان",           ""],
  ["بیمارستان فارابی",                    "مشهد", "بیمارستان",           ""],
  ["بیمارستان خاتم‌الانبیا",              "مشهد", "بیمارستان",           ""],
  ["بیمارستان رضوی",                      "مشهد", "بیمارستان",           ""],
  ["بیمارستان مهر",                       "مشهد", "بیمارستان",           ""],
  ["بیمارستان بنت‌الهدی",                 "مشهد", "بیمارستان",           ""],
  ["بیمارستان حضرت ام‌البنین",            "مشهد", "بیمارستان",           ""],
  ["بیمارستان جوادالائمه",                "مشهد", "بیمارستان",           ""],
  ["بیمارستان ثامن‌الائمه",               "مشهد", "بیمارستان",           ""],
  ["مرکز اهدای خون امام رضا",             "مشهد", "مرکز اهدای خون",      ""],
  ["مرکز اهدای خون شهید کریمی",           "مشهد", "مرکز اهدای خون",      ""],
  ["مرکز اهدای خون سیدالشهدا",            "مشهد", "مرکز اهدای خون",      ""],
  ["مرکز اهدای خون قاسم‌آباد",            "مشهد", "مرکز اهدای خون",      ""],
  ["مرکز اهدای خون امید",                 "مشهد", "مرکز اهدای خون",      ""],
  // ── Shiraz (15) ──────────────────────────────────────────────────────────
  ["بیمارستان نمازی",                     "شیراز", "بیمارستان",          ""],
  ["بیمارستان شهید فقیهی",                "شیراز", "بیمارستان",          ""],
  ["بیمارستان خلیلی",                     "شیراز", "بیمارستان",          ""],
  ["بیمارستان چمران",                     "شیراز", "بیمارستان",          ""],
  ["بیمارستان شهید رجایی",                "شیراز", "بیمارستان",          ""],
  ["بیمارستان حضرت زینب",                 "شیراز", "بیمارستان",          ""],
  ["بیمارستان کوثر",                      "شیراز", "بیمارستان",          ""],
  ["بیمارستان علی‌اصغر",                  "شیراز", "بیمارستان",          ""],
  ["بیمارستان دنا",                       "شیراز", "بیمارستان",          ""],
  ["بیمارستان مرکزی شیراز",               "شیراز", "بیمارستان",          ""],
  ["بیمارستان مادر و کودک غدیر",          "شیراز", "بیمارستان",          ""],
  ["مرکز اهدای خون نمازی",                "شیراز", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون قوامی",                "شیراز", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون ستارخان",              "شیراز", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون معالی‌آباد",           "شیراز", "مرکز اهدای خون",     ""],
  // ── Tabriz (10) ──────────────────────────────────────────────────────────
  ["بیمارستان امام رضا",                  "تبریز", "بیمارستان",          ""],
  ["بیمارستان سینا",                      "تبریز", "بیمارستان",          ""],
  ["بیمارستان شهید مدنی",                 "تبریز", "بیمارستان",          ""],
  ["بیمارستان کودکان مردانی‌آذر",         "تبریز", "بیمارستان",          ""],
  ["بیمارستان طالقانی",                   "تبریز", "بیمارستان",          ""],
  ["بیمارستان عالی‌نسب",                  "تبریز", "بیمارستان",          ""],
  ["بیمارستان شمس",                       "تبریز", "بیمارستان",          ""],
  ["مرکز اهدای خون استاد شهریار",         "تبریز", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون نصف‌راه",              "تبریز", "مرکز اهدای خون",     ""],
  ["مرکز اهدای خون آبرسان",               "تبریز", "مرکز اهدای خون",     ""],
];

const PROVINCE: Record<string, string> = {
  تهران: "تهران", شیراز: "فارس", اصفهان: "اصفهان", مشهد: "خراسان رضوی", تبریز: "آذربایجان شرقی",
  کاشان: "اصفهان", نجف‌آباد: "اصفهان", خمینی‌شهر: "اصفهان", شاهین‌شهر: "اصفهان",
};

function generateHospitals(): RegistryHospital[] {
  return HOSPITAL_DATA.map(([name, city, type], i) => ({
    hospitalId: creativeHospitalId(name, city, type),
    name,
    type,
    city,
    province: PROVINCE[city] || "",
    licenseNumber: `IR-MOH-${String(i + 1).padStart(3, "0")}-1401`,
    address: "",
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
//  Exported seed for consumption by other modules (auth, requests, …)
// ═══════════════════════════════════════════════════════════════════════════

export const SEED_DONORS = generateDonors();
export const SEED_HOSPITALS = generateHospitals();

// ═══════════════════════════════════════════════════════════════════════════
//  localStorage Init / Read / Write
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
//  Lookup
// ═══════════════════════════════════════════════════════════════════════════

function toWesternDigits(str: string): string {
  const persian: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
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

// ═══════════════════════════════════════════════════════════════════════════
//  CRUD Donors
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
//  CRUD Hospitals
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
//  Helpers for other modules
// ═══════════════════════════════════════════════════════════════════════════

/** Returns hospital IDs for demo accounts (first 5 hospitals) */
export function getDemoHospitalIds(): string[] {
  return generateHospitals().slice(0, 5).map((h) => h.hospitalId);
}

/** Returns the first demo donor national IDs (3 demo accounts) */
export function getDemoDonorNationalIds(): { nationalId: string; firstName: string; lastName: string; birthDate: string; phone: string }[] {
  return generateDonors().slice(0, 3).map((d) => ({
    nationalId: d.nationalId,
    firstName: d.firstName,
    lastName: d.lastName,
    birthDate: d.birthDate || "",
    phone: d.phone || "",
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
//  Reset
// ═══════════════════════════════════════════════════════════════════════════

export function resetRegistry(): void {
  localStorage.removeItem(REGISTRY_KEY);
  initRegistry();
}
