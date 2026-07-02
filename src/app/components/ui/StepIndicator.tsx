import { CheckCircle } from "lucide-react";

export const StepIndicator = ({ current, total, labels }: { current: number; total: number; labels: string[] }) => (
  <div className="flex items-center justify-center gap-0 mb-6" dir="ltr">
    {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
      <div key={s} className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${s < current ? "bg-green-500 text-white" : s === current ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
          {s < current ? <CheckCircle size={14} /> : s}
        </div>
        {s < total && <div className={`w-8 h-0.5 transition-colors ${s < current ? "bg-green-400" : "bg-border"}`} />}
      </div>
    ))}
  </div>
);
