import type { FiCode } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FiCode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/6",
        "bg-[#090c14]/80",
        "p-4",
      )}
    >
      <div className="flex items-center gap-2 text-xs text-white/25">
        <Icon />
        {label}
      </div>

      <p className="mt-2 truncate text-sm font-medium text-white/70">{value}</p>
    </div>
  );
}
