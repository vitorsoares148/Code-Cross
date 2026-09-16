import { FiAlertCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function AnalysisFailed({ title }: { title: string }) {
  return (
    <div
      className={cn(
        "flex min-h-full w-full items-center justify-center",
        "bg-[#050608] text-white",
      )}
    >
      <div className="max-w-md text-center">
        <div
          className={cn(
            "mx-auto flex size-16 items-center justify-center",
            "rounded-2xl border border-red-400/15",
            "bg-red-400/5",
          )}
        >
          <FiAlertCircle className="text-2xl text-red-400" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">A análise falhou</h1>

        <p className="mt-2 text-sm text-white/35">
          Não foi possível concluir a análise desta revisão.
        </p>

        <p className="mt-4 truncate text-xs text-white/20">{title}</p>
      </div>
    </div>
  );
}
