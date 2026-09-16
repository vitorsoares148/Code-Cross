import { FiCode } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function AnalysisLoading({ title }: { title: string }) {
  return (
    <div
      className={cn(
        "flex min-h-full w-full items-center justify-center",
        "bg-[#050608] text-white",
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "relative flex size-20 items-center justify-center",
            "border-sapphire-400/15 rounded-3xl border",
            "bg-sapphire-400/5",
          )}
        >
          <FiCode
            className={cn("text-sapphire-400 text-3xl", "animate-pulse")}
          />

          <span
            className={cn(
              "absolute inset-0 rounded-3xl",
              "border-sapphire-400/20 border",
              "animate-ping",
            )}
          />
        </div>

        <h1 className="mt-6 text-xl font-semibold">Análise em andamento</h1>

        <p className="mt-2 max-w-md text-sm text-white/35">
          A IA está analisando sua revisão.
        </p>

        <p className="mt-4 max-w-sm truncate text-xs text-white/20">{title}</p>

        <div className="mt-6 flex items-center gap-1">
          <span className="bg-sapphire-400/60 size-1.5 animate-bounce rounded-full" />
          <span
            className="bg-sapphire-400/60 size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="bg-sapphire-400/60 size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
