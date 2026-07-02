import { Droplets } from "lucide-react";

export const BloodBadge = ({ type, size = "md" }: { type: string; size?: "sm" | "md" | "lg" }) => {
  const s = { sm: "text-[10px] px-2 py-0.5 gap-0.5", md: "text-xs px-3 py-1 gap-1", lg: "text-lg px-5 py-2 gap-2 font-black" };
  return (
    <span className={`${s[size]} bg-primary text-white font-bold rounded-full inline-flex items-center`}>
      <Droplets size={size === "lg" ? 16 : size === "md" ? 11 : 9} className="opacity-80" />
      {type}
    </span>
  );
};
