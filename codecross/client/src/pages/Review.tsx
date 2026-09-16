import { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../components/generic/Loading";
import { getReview } from "../services/reviews.service";
import { cn } from "../utils/cn";
import AnalysisLoading from "../components/review/AnalyisLoading";
import AnalysisFailed from "../components/review/AnalyisFailed";
import ReviewContent from "../components/review/ReviewContent";

type ReviewFile = {
  id: number;
  filename: string;
  language: string;
  content: string;
};

export type Severity = "critical" | "high" | "medium" | "low" | "suggestion";

export type ReviewIssue = {
  id: number;
  file_id: number | null;
  severity: Severity;
  category: string;
  line_start: number;
  line_end: number;
  title: string;
  explanation: string;
  suggestion: string | null;
  corrected_code: string | null;
  created_at: string;
};

export type Review = {
  id: number;
  title: string;
  language: string;
  summary: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  files: ReviewFile[];
  issues: ReviewIssue[];
};

export const severityConfig: Record<
  string,
  {
    label: string;
    icon: typeof FiAlertCircle;
    className: string;
  }
> = {
  critical: {
    label: "Crítico",
    icon: FiAlertCircle,
    className: "text-red-400 bg-red-400/10 border-red-400/15",
  },
  high: {
    label: "Alto",
    icon: FiAlertCircle,
    className: "text-orange-400 bg-orange-400/10 border-orange-400/15",
  },
  medium: {
    label: "Médio",
    icon: FiAlertCircle,
    className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/15",
  },
  low: {
    label: "Baixo",
    icon: FiAlertCircle,
    className: "text-blue-400 bg-blue-400/10 border-blue-400/15",
  },
  suggestion: {
    label: "Sugestão",
    icon: FiCheckCircle,
    className: "text-sapphire-400 bg-sapphire-400/10 border-sapphire-400/15",
  },
};

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/reviews")}
      className={cn(
        "fixed top-6 left-70 z-50",
        "flex cursor-pointer items-center gap-2",
        "rounded-xl px-3 py-2",
        "text-sm text-white/40",
        "transition",
        "hover:bg-white/5",
        "hover:text-white/75",
      )}
    >
      <FiArrowLeft />
      Voltar
    </button>
  );
}

export default function Review() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reviewId) {
      navigate("/home", { replace: true });
      return;
    }

    const id = Number(reviewId);

    if (!Number.isInteger(id) || id <= 0) {
      setReview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setReview(null);

    let interval: ReturnType<typeof setInterval> | undefined;

    async function loadReview() {
      try {
        const result = await getReview(id);

        setReview(result);

        if (result.status === "completed" || result.status === "failed") {
          if (interval) {
            clearInterval(interval);
            interval = undefined;
          }

          return;
        }
      } catch (error) {
        console.error("Get review error:", error);

        setReview(null);

        if (interval) {
          clearInterval(interval);
          interval = undefined;
        }
      } finally {
        setLoading(false);
      }
    }

    loadReview();

    interval = setInterval(loadReview, 3000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [reviewId, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!review) {
    return (
      <>
        <BackButton />

        <main
          className={cn(
            "flex min-h-screen w-full items-center justify-center",
            "bg-[#050608] text-white",
          )}
        >
          <p className="text-sm text-white/40">
            Não foi possível encontrar esta revisão.
          </p>
        </main>
      </>
    );
  }

  if (review.status === "processing") {
    return (
      <>
        <BackButton />
        <AnalysisLoading title={review.title} />
      </>
    );
  }

  if (review.status === "failed") {
    return (
      <>
        <BackButton />
        <AnalysisFailed title={review.title} />
      </>
    );
  }

  return (
    <>
      <BackButton />
      <ReviewContent review={review} />
    </>
  );
}
