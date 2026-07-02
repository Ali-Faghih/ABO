const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const PERSIAN_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let days = (jy - 1) * 365 + Math.floor((jy - 1) / 33) * 8 + Math.floor(((jy - 1) % 33 + 3) / 4) + (jm <= 6 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) + jd - 1;
  let gy = 621 + Math.floor(days / 365.2422);
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  loop: for (;;) {
    const diff = days - (gy - 621) * 365 - Math.floor((gy - 621) / 4) * 1;
    if (diff >= 0) break;
    gy--;
  }
  days -= (gy - 621) * 365 + Math.floor((gy - 621) / 4) * 1;
  if (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) days++;
  for (let i = 0; i < 12; i++) {
    if (days < g_days_in_month[i]) return [gy, i + 1, days + 1];
    days -= g_days_in_month[i];
    if (gy % 4 === 0 && i === 1) days--;
  }
  return [gy, 12, 31];
}

export function getPersianDate(date: Date = new Date()): { year: number; month: number; day: number; monthName: string; display: string } {
  const [y, m, d] = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { year: y, month: m, day: d, monthName: PERSIAN_MONTHS[m - 1], display: `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}` };
}

export function persianDateString(date: Date = new Date()): string {
  return getPersianDate(date).display;
}

export function getMonthDays(year: number, month: number): { day: number; isToday: boolean; gregorian: Date }[] {
  const today = getPersianDate(new Date());
  const firstOfMonth = toGregorian(year, month, 1);
  const gDate = new Date(firstOfMonth[0], firstOfMonth[1] - 1, firstOfMonth[2]);
  const startDay = gDate.getDay(); // 0=Sun
  const monthLength = month <= 6 ? 31 : month <= 11 ? 30 : 29;
  const days: { day: number; isToday: boolean; gregorian: Date }[] = [];
  for (let i = 0; i < startDay; i++) days.push({ day: 0, isToday: false, gregorian: new Date(0) });
  for (let d = 1; d <= monthLength; d++) {
    const [gy, gm, gd] = toGregorian(year, month, d);
    days.push({ day: d, isToday: year === today.year && month === today.month && d === today.day, gregorian: new Date(gy, gm - 1, gd) });
  }
  while (days.length % 7 !== 0) days.push({ day: 0, isToday: false, gregorian: new Date(0) });
  return days;
}

export function parsePersianDate(persianStr: string): Date | null {
  const pe = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const en = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let s = persianStr;
  for (let i = 0; i < 10; i++) s = s.split(pe[i]).join(en[i]);
  const parts = s.split("/");
  if (parts.length !== 3) return null;
  const [jy, jm, jd] = parts.map(Number);
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
  const [gy, gm, gd] = toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[+d]);
}

export { PERSIAN_MONTHS, PERSIAN_DAYS };
