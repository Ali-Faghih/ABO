export const StatusBar = ({ dark = false }: { dark?: boolean }) => (
  <div className={`flex justify-between items-center px-6 pt-3.5 pb-1.5 ${dark ? "text-white" : "text-foreground"}`} style={{ direction: "ltr" }}>
    <span className="text-[13px] font-bold">۱۰:۳۰</span>
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-[2px]">
        {[3, 4, 5, 6].map((h, i) => (
          <div key={i} className={`w-[3px] rounded-sm ${dark ? "bg-white" : "bg-foreground/80"}`} style={{ height: h }} />
        ))}
      </div>
      <svg width="15" height="11" viewBox="0 0 24 18" fill="currentColor" className={dark ? "text-white" : "text-foreground/80"}>
        <path d="M12 4C16.4 4 20.3 5.8 23.1 8.7L24 7.8C21 4.6 16.7 2.5 12 2.5S3 4.6 0 7.8l.9.9C3.7 5.8 7.6 4 12 4z" />
        <path d="M12 8.5c3.1 0 5.9 1.2 8 3.2l.9-.9C18.6 8.5 15.5 7 12 7S5.4 8.5 3.1 10.8l.9.9c2.1-2 4.9-3.2 8-3.2z" />
        <circle cx="12" cy="15" r="2.5" />
      </svg>
      <div className="flex items-center gap-0.5">
        <div className={`w-6 h-3 rounded-[3px] border ${dark ? "border-white" : "border-foreground/80"} flex items-center px-[2px]`}>
          <div className={`h-[7px] w-[70%] rounded-sm ${dark ? "bg-white" : "bg-foreground/80"}`} />
        </div>
        <div className={`w-[2px] h-[5px] rounded-r-sm ${dark ? "bg-white" : "bg-foreground/80"}`} />
      </div>
    </div>
  </div>
);
