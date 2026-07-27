import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPersianDate, getMonthDays, PERSIAN_MONTHS, PERSIAN_DAYS, toPersianDigits } from "../../lib/persian-calendar";

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  bookedDays?: string[];
  allowPast?: boolean;
  minDate?: string;
}

const YEAR_RANGE = 80;

export const PersianCalendar = ({ selectedDate, onSelect, bookedDays = [], allowPast = false, minDate }: Props) => {
  const today = getPersianDate(new Date());
  const minParsed = minDate ? (() => { const [y, m] = minDate.split("/").map(Number); return { year: y, month: m }; })() : null;
  const initialMonth = minParsed && (minParsed.year > today.year || (minParsed.year === today.year && minParsed.month > today.month)) ? minParsed : today;
  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);
  const days = getMonthDays(viewYear, viewMonth);

  const maxMonth = (() => {
    if (allowPast) return null;
    if (minDate) {
      const [my, mm] = minDate.split("/").map(Number);
      return { year: my, month: mm };
    }
    return { year: today.year, month: today.month };
  })();
  const atMax = maxMonth && viewYear >= maxMonth.year && viewMonth >= maxMonth.month;

  const prevMonth = () => { if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); } else { setViewMonth(viewMonth - 1); } };
  const nextMonth = () => { if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); } else { setViewMonth(viewMonth + 1); } };

  const toPersianNum = (n: number) => toPersianDigits(n);

  const formatDateKey = (d: number) => `${viewYear}/${String(viewMonth).padStart(2, "0")}/${String(d).padStart(2, "0")}`;

  const isDisabled = (d: number) => {
    if (bookedDays.includes(formatDateKey(d))) return true;
    if (allowPast) return false;
    const key = formatDateKey(d);
    const [y, m, day] = key.split("/").map(Number);
    if (y < today.year) return true;
    if (y === today.year && m < today.month) return true;
    if (y === today.year && m === today.month && day < today.day) return true;
    if (minDate) {
      const [my, mm, md] = minDate.split("/").map(Number);
      if (y < my) return true;
      if (y === my && m < mm) return true;
      if (y === my && m === mm && day < md) return true;
    }
    return false;
  };

  const years = Array.from({ length: YEAR_RANGE }, (_, i) => today.year - (allowPast ? YEAR_RANGE - 1 - i : i));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
      <div className="flex items-center justify-between gap-2 mb-4">
        <button onClick={prevMonth} className="w-8 h-8 bg-muted/60 rounded-xl flex items-center justify-center flex-shrink-0"><ChevronRight size={16} className="text-foreground" /></button>
        <div className="flex items-center gap-2">
          <select value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))} className="text-sm font-bold text-foreground bg-muted/60 rounded-xl px-3 py-1.5 outline-none cursor-pointer">
            {PERSIAN_MONTHS.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
          </select>
          <select value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))} className="text-sm font-bold text-foreground bg-muted/60 rounded-xl px-3 py-1.5 outline-none cursor-pointer">
            {years.map((y) => <option key={y} value={y}>{toPersianNum(y)}</option>)}
          </select>
        </div>
        <button onClick={nextMonth} className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${atMax ? "opacity-30 cursor-not-allowed" : "bg-muted/60"}`} disabled={atMax}><ChevronLeft size={16} className="text-foreground" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {PERSIAN_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d.day === 0) return <div key={`e-${i}`} />;
          const key = formatDateKey(d.day);
          const isSelected = key === selectedDate;
          const isToday = d.isToday;
          const disabled = isDisabled(d.day);
          return (
            <button key={key} disabled={disabled} onClick={() => onSelect(key)}
              className={`text-center text-sm py-2 rounded-xl transition-all font-medium
                ${isSelected ? "bg-primary text-white shadow-sm" : isToday ? "bg-primary/8 text-primary" : disabled ? "text-muted-foreground/30 line-through cursor-not-allowed" : "text-foreground hover:bg-muted/60"}`}>
              {toPersianNum(d.day)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
