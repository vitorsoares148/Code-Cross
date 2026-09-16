import {
  FiAlertCircle,
  FiCheckCircle,
  FiCode,
  FiFileText,
} from "react-icons/fi";
import { cn } from "../../utils/cn";
import type { Review } from "../../pages/Review";
import InfoCard from "./InfoCard";
import IssueCard from "./IssueCard";

const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  suggestion: 4,
};

export default function ReviewContent({ review }: { review: Review }) {
  const sortedIssues = [...review.issues].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <div className={cn("min-h-full w-full", "bg-[#050608] text-white")}>
      <div className={cn("mx-auto w-full max-w-7xl", "px-6 py-10")}>
        <header className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center",
                    "border-sapphire-400/20 rounded-xl border",
                    "bg-sapphire-400/10",
                  )}
                >
                  <FiCode className="text-sapphire-400 text-lg" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-tight">
                    {review.title}
                  </h1>

                  <p className="mt-1 text-sm text-white/35">
                    Resultado da análise de código
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 items-center gap-2",
                "rounded-lg border border-emerald-400/15",
                "bg-emerald-400/5",
                "px-3 py-2",
                "text-xs font-medium text-emerald-400",
              )}
            >
              <FiCheckCircle />
              Concluída
            </div>
          </div>
        </header>

        {/* Review metadata */}
        <div className={cn("mb-6 grid gap-4", "sm:grid-cols-2 lg:grid-cols-3")}>
          <InfoCard
            icon={FiFileText}
            label="Arquivo"
            value={review.files[0]?.filename ?? "—"}
          />

          <InfoCard icon={FiCode} label="Linguagem" value={review.language} />

          <InfoCard
            icon={FiAlertCircle}
            label="Problemas encontrados"
            value={String(review.issues.length)}
          />
        </div>

        {/* Summary */}
        <section
          className={cn(
            "border-sapphire-400/10 mb-6 rounded-3xl border",
            "bg-[#090c14]/95",
            "p-6 shadow-2xl shadow-black/20",
          )}
        >
          <h2 className="text-sm font-semibold text-white">Resumo</h2>

          <p className="mt-3 text-sm leading-7 text-white/55">
            {review.summary}
          </p>
        </section>

        {/* Issues */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Problemas encontrados
            </h2>

            <span className="text-xs text-white/25">
              {review.issues.length}{" "}
              {review.issues.length === 1 ? "problema" : "problemas"}
            </span>
          </div>

          <div className="space-y-4">
            {sortedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
