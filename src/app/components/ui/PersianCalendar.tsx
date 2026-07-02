import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPersianDate, getMonthDays, PERSIAN_MONTHS, PERSIAN_DAYS, toPersianDigits } from "../../lib/persian-calendar";

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  bookedDays?: string[];
}

export const PersianCalendar = ({ selectedDate, onSelect, bookedDays = [] }: Props) => {
  const today = getPersianDate(new Date());
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const days = getMonthDays(viewYear, viewMonth);

  const prevMonth = () => { if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); } else { setViewMonth(viewMonth - 1); } };
  const nextMonth = () => { if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); } else { setViewMonth(viewMonth + 1); } };

  const toPersianNum = (n: number) => toPersianDigits(n);

  const formatDateKey = (d: number) => `${viewYear}/${String(viewMonth).padStart(2, "0")}/${String(d).padStart(2, "0")}`;

  const isPast = (d: number) => {
    const key = formatDateKey(d);
    const [y, m, day] = key.split("/").map(Number);
    if (y < today.year) return true;
    if (y === today.year && m < today.month) return true;
    if (y === today.year && m === today.month && day < today.day) return true;
    return false;
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 bg-muted/60 rounded-xl flex items-center justify-center"><ChevronRight size={16} className="text-foreground" /></button>
        <span className="text-sm font-bold text-foreground">{PERSIAN_MONTHS[viewMonth - 1]} {toPersianNum(viewYear)}</span>
        <button onClick={nextMonth} className="w-8 h-8 bg-muted/60 rounded-xl flex items-center justify-center"><ChevronLeft size={16} className="text-foreground" /></button>
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
          const disabled = isPast(d.day) || bookedDays.includes(key);
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
