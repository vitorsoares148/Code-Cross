import { cn } from "../../utils/cn";

export default function Loading() {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center",
        "bg-[#050608]",
      )}
    >
      <div
        className={cn(
          "size-8 animate-spin rounded-full",
          "border-2 border-white/10",
          "border-t-sapphire-400",
        )}
      />
    </div>
  );
}
