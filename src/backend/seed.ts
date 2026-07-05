import bcryptjs from "bcryptjs";
import { getDb, saveDb } from "./db.js";

// ─── Creative ID helpers (ported from frontend registryDb) ─────────────────

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

function creativeNationalId(idx: number, firstName: string, lastName: string, birthYear: string): string {
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

// ─── Seed ──────────────────────────────────────────────────────────────────

export async function seedAll() {
  const db = getDb();
  const userCount = db.exec("SELECT COUNT(*) as c FROM users");
  if (userCount.length > 0 && userCount[0].values[0][0] > 0) return;

  const pw = await bcryptjs.hash("12345678", 10);

  // ── Registry donors (100) ────────────────────────────────────────────────
  const MALE_NAMES = ["علی","محمد","امیر","حسن","حسین","رضا","مهدی","احمد","سعید","مصطفی","کاوه","بابک","شهرام","بهرام","نادر","فرهاد","کامران","داریوش","آرش","امید","سامان","کیوان","مهرداد","وحید","حمید","میثم","جواد","پیمان","فرشاد","بهنام","رسول","منصور","جمشید","مجید","سجاد","میلاد","حامد","ایمان","افشین","جهانگیر","ایرج","تورج","شاپور","بهمن","کوروش","داوود","صادق","نقی","تقی","اکبر"];
  const FEMALE_NAMES = ["فاطمه","زهرا","مریم","نرگس","سارا","زینب","لیلا","مهناز","شهرزاد","پریسا","الهام","ناهید","هنگامه","شیرین","مهسا","یاسمن","نازنین","بهناز","سمانه","راحله","مینا","شیما","رؤیا","سحر","مژگان","فرشته","سودابه","مرجان","آرزو","گیتی","پروین","شهلا","فروغ","فریده","فریبا","لیلی","عاطفه","نسترن","سپیده","بهاره","غزل","سوسن","ژیلا","شقایق","نیلوفر","پرستو","باران","بهار","نیکا","ترانه"];
  const LAST_NAMES = ["محمدی","حسینی","رضایی","احمدی","کریمی","موسوی","جعفری","عباسی","قاسمی","سلیمانی","اکبری","صادقی","میرزایی","نوری","کاظمی","حیدری","شریفی","رحیمی","ابراهیمی","طاهری","فرجی","صالحی","مرادی","رستمی","نادری","صمدی","تقوی","حسنی","مظفری","جهانگیری","حکیمی","عابدی","عسگری","بهرامی","اسدی","داوودی","زارعی","غلامی","نظری","وکیلی","فتاحی","محمودی","خلیلی","صنعتی","یوسفی","کاشانی","نجفی","طباطبایی","مقدم","پوراحمد"];

  let idx = 0;
  for (let i = 0; i < 50; i++) {
    const fn = MALE_NAMES[i];
    const ln = LAST_NAMES[i % LAST_NAMES.length];
    const year = 1345 + ((i * 37 + 17) % 40);
    const month = 1 + ((i * 13 + 5) % 12);
    const day = 1 + ((i * 7 + 3) % 28);
    const bd = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    const nationalId = creativeNationalId(idx, fn, ln, String(year));
    db.run("INSERT OR IGNORE INTO registry_donors VALUES (?,?,?,?,?,?)", [nationalId, fn, ln, bd, `09121230${String(1000 + idx).slice(1)}`, "male"]);
    idx++;
  }
  for (let i = 0; i < 50; i++) {
    const fn = FEMALE_NAMES[i];
    const ln = LAST_NAMES[(50 + i) % LAST_NAMES.length];
    const year = 1350 + ((i * 29 + 13) % 36);
    const month = 1 + ((i * 11 + 7) % 12);
    const day = 1 + ((i * 5 + 11) % 28);
    const bd = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    const nationalId = creativeNationalId(idx, fn, ln, String(year));
    db.run("INSERT OR IGNORE INTO registry_donors VALUES (?,?,?,?,?,?)", [nationalId, fn, ln, bd, `09391231${String(1000 + idx).slice(1)}`, "female"]);
    idx++;
  }

  // ── Registry hospitals (95) ──────────────────────────────────────────────
  const HOSPITALS: [string, string, string, string][] = [
    ["بیمارستان امام خمینی","تهران","بیمارستان",""],["بیمارستان شریعتی","تهران","بیمارستان",""],["بیمارستان سینا","تهران","بیمارستان",""],["بیمارستان رسول اکرم","تهران","بیمارستان",""],["بیمارستان فیروزگر","تهران","بیمارستان",""],["بیمارستان شهدای تجریش","تهران","بیمارستان",""],["بیمارستان لقمان حکیم","تهران","بیمارستان",""],["بیمارستان بهارلو","تهران","بیمارستان",""],["بیمارستان طرفه","تهران","بیمارستان",""],["بیمارستان هفتم تیر","تهران","بیمارستان",""],["بیمارستان قلب شهید رجایی","تهران","بیمارستان تخصصی",""],["بیمارستان مسیح دانشوری","تهران","بیمارستان",""],["بیمارستان کودکان مفید","تهران","بیمارستان",""],["بیمارستان حضرت علی‌اصغر","تهران","بیمارستان",""],["بیمارستان اکبرآبادی","تهران","بیمارستان",""],["بیمارستان یاس","تهران","بیمارستان",""],["بیمارستان ضیائیان","تهران","بیمارستان",""],["بیمارستان عرفان نیایش","تهران","بیمارستان",""],["بیمارستان پارس","تهران","بیمارستان",""],["بیمارستان مهر","تهران","بیمارستان",""],["بیمارستان دی","تهران","بیمارستان",""],["بیمارستان آتیه","تهران","بیمارستان",""],["بیمارستان خاتم الانبیاء","تهران","بیمارستان",""],["بیمارستان خاتم‌الانبیا (نیروی انتظامی)","تهران","بیمارستان",""],["بیمارستان میلاد","تهران","بیمارستان",""],["مرکز اهدای خون وصال","تهران","مرکز اهدای خون",""],["مرکز اهدای خون ستاری","تهران","مرکز اهدای خون",""],["مرکز اهدای خون تهرانپارس","تهران","مرکز اهدای خون",""],["مرکز اهدای خون شهرری","تهران","مرکز اهدای خون",""],["مرکز اهدای خون پیروزی","تهران","مرکز اهدای خون",""],["بیمارستان الزهرا","اصفهان","بیمارستان",""],["بیمارستان خورشید","اصفهان","بیمارستان",""],["بیمارستان امین","اصفهان","بیمارستان",""],["بیمارستان سیدالشهدا","اصفهان","بیمارستان",""],["بیمارستان عیسی بن مریم","اصفهان","بیمارستان",""],["بیمارستان کاشانی","اصفهان","بیمارستان",""],["بیمارستان غرضی","اصفهان","بیمارستان",""],["بیمارستان سینا","اصفهان","بیمارستان",""],["بیمارستان شهید چمران","اصفهان","بیمارستان",""],["بیمارستان خانواده","اصفهان","بیمارستان",""],["بیمارستان میلاد","اصفهان","بیمارستان",""],["بیمارستان سعدی","اصفهان","بیمارستان",""],["بیمارستان بهشتی","کاشان","بیمارستان",""],["بیمارستان متینی","کاشان","بیمارستان",""],["بیمارستان شهید محمد منتظری","نجف‌آباد","بیمارستان",""],["مرکز اهدای خون خواجو","اصفهان","مرکز اهدای خون",""],["مرکز اهدای خون شریعتی","اصفهان","مرکز اهدای خون",""],["مرکز اهدای خون عاشق اصفهانی","اصفهان","مرکز اهدای خون",""],["مرکز اهدای خون خمینی‌شهر","خمینی‌شهر","مرکز اهدای خون",""],["مرکز اهدای خون شاهین‌شهر","شاهین‌شهر","مرکز اهدای خون",""],["بیمارستان امام رضا","مشهد","بیمارستان",""],["بیمارستان قائم","مشهد","بیمارستان",""],["بیمارستان دکتر شریعتی","مشهد","بیمارستان",""],["بیمارستان هاشمی‌نژاد","مشهد","بیمارستان",""],["بیمارستان ابن‌سینا","مشهد","بیمارستان",""],["بیمارستان اکبر","مشهد","بیمارستان",""],["بیمارستان امدادی شهید کامیاب","مشهد","بیمارستان",""],["بیمارستان فارابی","مشهد","بیمارستان",""],["بیمارستان خاتم‌الانبیا","مشهد","بیمارستان",""],["بیمارستان رضوی","مشهد","بیمارستان",""],["بیمارستان مهر","مشهد","بیمارستان",""],["بیمارستان بنت‌الهدی","مشهد","بیمارستان",""],["بیمارستان حضرت ام‌البنین","مشهد","بیمارستان",""],["بیمارستان جوادالائمه","مشهد","بیمارستان",""],["بیمارستان ثامن‌الائمه","مشهد","بیمارستان",""],["مرکز اهدای خون امام رضا","مشهد","مرکز اهدای خون",""],["مرکز اهدای خون شهید کریمی","مشهد","مرکز اهدای خون",""],["مرکز اهدای خون سیدالشهدا","مشهد","مرکز اهدای خون",""],["مرکز اهدای خون قاسم‌آباد","مشهد","مرکز اهدای خون",""],["مرکز اهدای خون امید","مشهد","مرکز اهدای خون",""],["بیمارستان نمازی","شیراز","بیمارستان",""],["بیمارستان شهید فقیهی","شیراز","بیمارستان",""],["بیمارستان خلیلی","شیراز","بیمارستان",""],["بیمارستان چمران","شیراز","بیمارستان",""],["بیمارستان شهید رجایی","شیراز","بیمارستان",""],["بیمارستان حضرت زینب","شیراز","بیمارستان",""],["بیمارستان کوثر","شیراز","بیمارستان",""],["بیمارستان علی‌اصغر","شیراز","بیمارستان",""],["بیمارستان دنا","شیراز","بیمارستان",""],["بیمارستان مرکزی شیراز","شیراز","بیمارستان",""],["بیمارستان مادر و کودک غدیر","شیراز","بیمارستان",""],["مرکز اهدای خون نمازی","شیراز","مرکز اهدای خون",""],["مرکز اهدای خون قوامی","شیراز","مرکز اهدای خون",""],["مرکز اهدای خون ستارخان","شیراز","مرکز اهدای خون",""],["مرکز اهدای خون معالی‌آباد","شیراز","مرکز اهدای خون",""],["بیمارستان امام رضا","تبریز","بیمارستان",""],["بیمارستان سینا","تبریز","بیمارستان",""],["بیمارستان شهید مدنی","تبریز","بیمارستان",""],["بیمارستان کودکان مردانی‌آذر","تبریز","بیمارستان",""],["بیمارستان طالقانی","تبریز","بیمارستان",""],["بیمارستان عالی‌نسب","تبریز","بیمارستان",""],["بیمارستان شمس","تبریز","بیمارستان",""],["مرکز اهدای خون استاد شهریار","تبریز","مرکز اهدای خون",""],["مرکز اهدای خون نصف‌راه","تبریز","مرکز اهدای خون",""],["مرکز اهدای خون آبرسان","تبریز","مرکز اهدای خون",""],
  ];

  const PROVINCE: Record<string, string> = { تهران: "تهران", شیراز: "فارس", اصفهان: "اصفهان", مشهد: "خراسان رضوی", تبریز: "آذربایجان شرقی", کاشان: "اصفهان", نجف‌آباد: "اصفهان", خمینی‌شهر: "اصفهان", شاهین‌شهر: "اصفهان" };

  const LIC_CITY: Record<string, string> = {
    تهران: "110", شیراز: "210", اصفهان: "310", مشهد: "410",
    تبریز: "510", کاشان: "610", نجف‌آباد: "710",
    خمینی‌شهر: "810", شاهین‌شهر: "910",
  };
  function licSuffix(idx: number): string {
    let n = (idx * 571 + 3333) % 8999 + 1000;
    while (n >= 1300 && n < 1500) n = (n + 500) % 8999 + 1000;
    return String(n);
  }
  HOSPITALS.forEach(([name, city, type], i) => {
    const hid = creativeHospitalId(name, city, type);
    const licNum = `${LIC_CITY[city] || "000"}-${licSuffix(i)}`;
    db.run("INSERT OR IGNORE INTO registry_hospitals VALUES (?,?,?,?,?,?,?)", [hid, name, type, city, PROVINCE[city] || "", `IR-MOH-${licNum}`, ""]);
  });

  // ── Demo users (5 hospitals + 8 donors) ──────────────────────────────────
  const regHospitals = db.exec("SELECT * FROM registry_hospitals LIMIT 5")[0]?.values || [];
  const maleDonors = db.exec("SELECT * FROM registry_donors WHERE gender='male' LIMIT 4")[0]?.values || [];
  const femaleDonors = db.exec("SELECT * FROM registry_donors WHERE gender='female' LIMIT 4")[0]?.values || [];
  const regDonors = [...maleDonors, ...femaleDonors]; // 8 total
  const today = new Date().toLocaleDateString("fa-IR");

  const DONOR_CITIES = ["تهران", "اصفهان", "شیراز", "تهران", "اصفهان", "مشهد", "تبریز", "شیراز"];
  const DONOR_BLOOD = ["O+", "A+", "B-", "B+", "A-", "AB+", "O-", "O+"];
  const DONOR_WEIGHTS = [75, 65, 60, 72, 68, 80, 70, 63];
  const DONOR_HEIGHTS = [172, 165, 162, 170, 167, 180, 175, 160];
  const DONOR_ELIGIBLE = [1, 1, 1, 1, 1, 1, 0, 1];
  const DONOR_READINESS = [1, 1, 1, 1, 1, 1, 1, 1];
  const DONOR_SCORES = [3, 2, 1, 0, 0, 0, 0, 0];

  const DONOR_ADDRESSES = [
    "خیابان ولیعصر، تهران", "خیابان چهارباغ، اصفهان", "بلوار زند، شیراز",
    "خیابان کارگر شمالی، تهران", "خیابان سعدی، اصفهان",
    "خیابان امام رضا، مشهد", "خیابان تربیت، تبریز", "خیابان حافظ، شیراز",
  ];

  regDonors.forEach((r: any, i: number) => {
    const id = `seed-donor-${String(i + 1).padStart(3, "0")}`;
    const nationalId = r[0];
    const firstName = r[1];
    const lastName = r[2];
    const phone = r[4] || "";
    const gender = r[5] || "male";
    const city = DONOR_CITIES[i];
    const bloodType = DONOR_BLOOD[i];
    db.run("INSERT OR IGNORE INTO users VALUES (?,?,?,?,?)", [id, "donor", nationalId, pw, today]);
    db.run(`INSERT OR IGNORE INTO donor_profiles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      id, firstName, lastName, phone, "", gender, city, city,
      DONOR_ADDRESSES[i],
      DONOR_WEIGHTS[i], DONOR_HEIGHTS[i], bloodType, "", "", DONOR_READINESS[i], null, DONOR_ELIGIBLE[i],
      i < 3 ? null : null, i < 3 ? null : null, today, DONOR_SCORES[i],
    ]);
  });

  // Demo hospitals
  const demoIds = regHospitals.map((r: any) => r[0]);
  const hospData: any[] = [
    [0, "احمد", "رضایی", "دولتی", 1, 3, 1, 350, "۱۳۴۲"],
    [1, "محمد", "کریمی", "دانشگاهی - آموزشی", 1, 2, 0, 280, "۱۳۵۰"],
    [2, "سعید", "احمدی", "دولتی", 1, 5, 2, 200, "۱۳۸۵"],
    [3, "دکتر", "نوروزی", "دولتی", 1, 10, 5, 100, "۱۳۵۳"],
    [4, "رضا", "موسوی", "تأمین اجتماعی", 1, 1, 0, 150, "۱۳۹۰"],
  ];

  hospData.forEach(([idx, mgrF, mgrL, hType, ar, td, tdon, beds, founded]: any, i: number) => {
    const id = `seed-hosp-00${i + 1}`;
    const rh = regHospitals[i];
    db.run("INSERT OR IGNORE INTO users VALUES (?,?,?,?,?)", [id, "hospital", demoIds[i], pw, today]);
    db.run(`INSERT OR IGNORE INTO hospital_profiles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      id, demoIds[i], rh[1], hType, rh[3], rh[4],
      ["خیابان ولیعصر، تهران", "خیابان کارگر شمالی، تهران", "خیابان سینا، تهران", "خیابان نیایش، تهران", "خیابان انقلاب اسلامی، تهران"][i],
      `021-611${12345 + i * 11111}`.slice(0, 12), rh[5],
      mgrF, mgrL, "", ["مدیر عامل", "رئیس بیمارستان", "مدیر عامل", "مدیر عامل", "مدیر عامل"][i], `0912111100${i + 1}`,
      ar, td, tdon, [4.5, 4.2, 4.7, 4.8, 4.0][i], beds, founded,
      [1, 0, 1, 1, 0][i], today,
    ]);
  });

  // ── Seed notifications ─────────────────────────────────────────────────────
  // Donor 1: confirmed appointment (APPT-001) → gets confirmation + reminder
  db.run("INSERT OR IGNORE INTO notifications VALUES (?,?,?,?,?,?,?)", ["NOTIF-D1-001", "seed-donor-001", "appointment", "نوبت تأیید شد", "نوبت اهدای خون شما در بیمارستان امام خمینی برای تاریخ ۱۴۰۵/۰۴/۱۴ ساعت ۰۹:۰۰ تأیید شد.", "۱۰:۳۰", 0]);
  db.run("INSERT OR IGNORE INTO notifications VALUES (?,?,?,?,?,?,?)", ["NOTIF-D1-002", "seed-donor-001", "reminder", "یادآوری نوبت", "فردا نوبت اهدای خون دارید. لطفاً شب قبل استراحت کافی داشته باشید.", "۰۸:۰۰", 0]);
  // Donor 2: pending appointment → NO notification yet (waiting for hospital)
  // Donor 3: pending appointment → NO notification yet (waiting for hospital)

  // Hospital 1 (Imam Khomeini): new appointment request from Donor 1
  db.run("INSERT OR IGNORE INTO notifications VALUES (?,?,?,?,?,?,?)", ["NOTIF-H1-001", "seed-hosp-001", "appointment", "درخواست نوبت جدید", "داوطلب علی محمدی برای تاریخ ۱۴۰۵/۰۴/۱۴ ساعت ۰۹:۰۰ درخواست نوبت اهدای خون داده است.", "۱۰:۳۰", 0]);
  // Hospital 1: active urgent request
  db.run("INSERT OR IGNORE INTO notifications VALUES (?,?,?,?,?,?,?)", ["NOTIF-H1-002", "seed-hosp-001", "request", "درخواست خون فوری", "درخواست ۲ واحد O- فوری برای بیمار بدحال ثبت شد.", "۱۰:۰۰", 0]);
  // Hospital 3 (Sina): new appointment request from Donor 2
  db.run("INSERT OR IGNORE INTO notifications VALUES (?,?,?,?,?,?,?)", ["NOTIF-H3-001", "seed-hosp-003", "appointment", "درخواست نوبت جدید", "داوطلب محمد حسینی برای تاریخ ۱۴۰۵/۰۴/۱۵ ساعت ۱۰:۰۰ درخواست نوبت اهدای خون داده است.", "۱۰:۳۰", 0]);
  // Hospital 2 (Shariati): new appointment request from Donor 3
  db.run("INSERT OR IGNORE INTO notifications VALUES (?,?,?,?,?,?,?)", ["NOTIF-H2-001", "seed-hosp-002", "appointment", "درخواست نوبت جدید", "داوطلب امیر رضایی برای تاریخ ۱۴۰۵/۰۴/۲۰ ساعت ۱۴:۰۰ درخواست نوبت اهدای خون داده است.", "۱۴:۳۰", 0]);

  // ── Seed requests ─────────────────────────────────────────────────────────
  const firstHospId = demoIds[0];
  const firstHospName = regHospitals[0][1];
  const now = new Date().toLocaleDateString("fa-IR");

  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-001", firstHospId, firstHospName, "O-", 2, "فوری", "۱۴۰۵/۰۴/۱۰", "active", 1, "تهران", now, "بیمار بدحال نیاز فوری دارد"]);
  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-002", demoIds[1], regHospitals[1][1], "A+", 1, "معمولی", "۱۴۰۵/۰۴/۱۲", "active", 0, "تهران", now, ""]);
  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-003", demoIds[2], regHospitals[2][1], "B+", 3, "فوری", "۱۴۰۵/۰۴/۰۸", "active", 2, "تهران", now, "سه بیمار نیاز دارند"]);
  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-004", demoIds[3], regHospitals[3][1], "AB-", 1, "معمولی", "۱۴۰۵/۰۴/۱۴", "active", 0, "تهران", now, ""]);
  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-005", demoIds[4], regHospitals[4][1], "A-", 2, "معمولی", "۱۴۰۵/۰۴/۱۵", "active", 0, "تهران", now, ""]);
  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-006", firstHospId, firstHospName, "AB+", 3, "معمولی", "۱۴۰۵/۰۳/۲۸", "completed", 3, "تهران", "۲۸ خرداد ۱۴۰۵", "تکمیل شده"]);
  db.run("INSERT OR IGNORE INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["REQ-007", demoIds[1], regHospitals[1][1], "B+", 2, "فوری", "۱۴۰۵/۰۴/۲۰", "active", 0, "اصفهان", now, ""]);

  // ── Seed appointments ─────────────────────────────────────────────────────
  db.run("INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["APPT-001", "REQ-001", "seed-donor-001", "علی محمدی", firstHospId, firstHospName, "O-", "۱۴۰۵/۰۴/۱۴", "۰۹:۰۰", "confirmed", now, "donor"]);
  db.run("INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["APPT-002", "REQ-003", "seed-donor-002", "محمد حسینی", demoIds[2], regHospitals[2][1], "B+", "۱۴۰۵/۰۴/۱۵", "۱۰:۰۰", "pending", now, "donor"]);
  db.run("INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["APPT-003", "REQ-006", "seed-donor-001", "علی محمدی", firstHospId, firstHospName, "AB+", "۱۴۰۵/۰۳/۲۷", "۱۱:۰۰", "completed", "۲۷ خرداد ۱۴۰۵", "donor"]);
  db.run("INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["APPT-004", "REQ-007", "seed-donor-003", "امیر رضایی", demoIds[1], regHospitals[1][1], "B-", "۱۴۰۵/۰۴/۲۰", "۱۴:۰۰", "pending", now, "donor"]);

  // ── Seed conversation + messages ──────────────────────────────────────────
  db.run("INSERT OR IGNORE INTO conversations VALUES (?,?,?,?,?,?,?)", ["CONV-001", firstHospId, "seed-donor-001", "REQ-001", "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید", "۱۰:۳۵", 1]);
  const msgs = [
    ["MSG-001", "CONV-001", firstHospId, "سلام، آیا آمادگی اهدای خون دارید؟", "۱۰:۰۰"],
    ["MSG-002", "CONV-001", "seed-donor-001", "بله، گروه خونی O+ دارم و آماده‌ام", "۱۰:۰۵"],
    ["MSG-003", "CONV-001", firstHospId, "عالی! آیا فردا ساعت ۹ می‌توانید تشریف بیاورید؟", "۱۰:۱۵"],
    ["MSG-004", "CONV-001", firstHospId, "آدرس: خیابان ولیعصر، بیمارستان امام خمینی، طبقه اول", "۱۰:۱۶"],
    ["MSG-005", "CONV-001", "seed-donor-001", "بسیار خب، فردا ساعت ۹ حضور خواهم داشت", "۱۰:۳۰"],
    ["MSG-006", "CONV-001", firstHospId, "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید", "۱۰:۳۵"],
  ];
  msgs.forEach(([id, cid, sid, text, ts]) => {
    db.run("INSERT OR IGNORE INTO messages VALUES (?,?,?,?,?)", [id, cid, sid, text, ts]);
  });

  // ── Seed magazine articles ────────────────────────────────────────────────
  const articles: [string, string, string, string, string, string, string][] = [
    ["MAG-001", "اهمیت اهدای خون و تأثیر آن بر سلامت جامعه", "اهدای خون یکی از والاترین اقدامات انسانی است...", "با اهدای خون خود، به نجات جان دیگران کمک کنید.", "دکتر علی رضایی", "آموزشی", "اهدای خون,سلامت,فرهنگ سازی"],
    ["MAG-002", "شرایط و ضوابط اهدای خون", "برای اهدای خون، باید شرایط زیر را داشته باشید...", "آیا شرایط اهدای خون را دارید؟", "دکتر مریم حسینی", "راهنما", "شرایط اهدا,سلامت,راهنما"],
    ["MAG-003", "گروه‌های خونی و سازگاری در اهدای خون", "شناخت گروه‌های خونی و سازگاری آنها...", "همه چیز درباره گروه‌های خونی.", "دکتر سعید کریمی", "آموزشی", "گروه خونی,سازگاری,آموزشی"],
    ["MAG-004", "بعد از اهدای خون چه باید کرد؟", "مراقبت‌های پس از اهدای خون...", "راهنمای کامل مراقبت‌های پس از اهدا.", "دکتر نرگس محمدی", "راهنما", "مراقبت,اهدای خون,بعد از اهدا"],
    ["MAG-005", "بیماری‌هایی که با انتقال خون درمان می‌شوند", "انتقال خون در درمان بسیاری از بیماری‌ها...", "نقش اهدای خون در نجات جان بیماران.", "دکتر احمد عباسی", "آموزشی", "انتقال خون,بیماری,درمان"],
    ["MAG-006", "تغذیه مناسب قبل از اهدای خون", "تغذیه مناسب قبل از اهدای خون...", "راهنمای تغذیه مناسب قبل از اهدا.", "دکتر فاطمه احمدی", "سلامت", "تغذیه,اهدای خون,سلامت"],
  ];
  articles.forEach(([id, title, content, summary, author, category, tags]) => {
    db.run("INSERT OR IGNORE INTO articles VALUES (?,?,?,?,?,?,?,?,?,?,?)", [id, title, content, summary, author, category, JSON.stringify(tags.split(",")), null, "۱۴۰۵/۰۱/۱۵", 0, "published"]);
  });

  saveDb();
  console.log("✅ Seed complete: 100 registry donors, 95 registry hospitals, 8 demo donors, 5 demo hospitals, 7 seed requests, 4 appointments, 1 conversation, 6 messages, 6 articles");
}
