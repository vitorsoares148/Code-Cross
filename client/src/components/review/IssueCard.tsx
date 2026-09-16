import { FiCode, FiZap } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { severityConfig, type ReviewIssue } from "../../pages/Review";

export default function IssueCard({ issue }: { issue: ReviewIssue }) {
  const severity = severityConfig[issue.severity] ?? severityConfig.suggestion;

  const SeverityIcon = severity.icon;

  return (
    <article
      className={cn(
        "rounded-2xl border border-white/6",
        "bg-[#090c14]/80",
        "p-5",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                "rounded-md border",
                "px-2 py-1",
                "text-[11px] font-medium",
                severity.className,
              )}
            >
              <SeverityIcon size={12} />
              {severity.label}
            </span>

            <span className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/35">
              {issue.category}
            </span>

            {issue.line_start > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-white/20">
                <FiCode size={11} />
                Linha {issue.line_start}
                {issue.line_end !== issue.line_start && `–${issue.line_end}`}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-sm font-semibold text-white/85">
            {issue.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/50">
        {issue.explanation}
      </p>

      {issue.suggestion && (
        <div
          className={cn(
            "mt-4 rounded-xl",
            "border-sapphire-400/10 border",
            "bg-sapphire-400/5",
            "p-4",
          )}
        >
          <div className="text-sapphire-300 flex items-center gap-2 text-xs font-medium">
            <FiZap size={13} />
            Sugestão
          </div>

          <p className="mt-2 text-sm leading-6 text-white/45">
            {issue.suggestion}
          </p>
        </div>
      )}

      {issue.corrected_code && (
        <pre
          className={cn(
            "mt-4 overflow-x-auto rounded-xl",
            "border border-white/6",
            "bg-[#06080d]",
            "p-4",
            "font-mono text-xs leading-6 text-white/60",
          )}
        >
          <code>{issue.corrected_code}</code>
        </pre>
      )}
    </article>
  );
}
