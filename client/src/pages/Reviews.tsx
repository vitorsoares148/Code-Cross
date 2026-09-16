import { useEffect, useMemo, useState } from "react";
import { FiClock, FiFileText, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { deleteReview, getReviews } from "../services/reviews.service";
import { cn } from "../utils/cn";
import { formatDateFull } from "../utils/formatDate";

type Review = {
  id: number;
  title: string;
  language: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
};

const ITEMS_PER_PAGE = 8;

const statusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-400/10 text-yellow-300",
  },
  processing: {
    label: "Analisando",
    className: "bg-sapphire-400/10 text-sapphire-300",
  },
  completed: {
    label: "Concluída",
    className: "bg-green-400/10 text-green-300",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-400/10 text-red-300",
  },
};

export default function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadReviews() {
      try {
        const result = await getReviews();
        setReviews(result);
      } catch (error) {
        console.error("Get reviews error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [reviews]);

  const totalPages = Math.ceil(sortedReviews.length / ITEMS_PER_PAGE);

  const currentReviews = sortedReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
    reviewId: number,
  ) {
    event.stopPropagation();

    try {
      await deleteReview(reviewId);

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId),
      );

      window.dispatchEvent(new Event("reviews:updated"));

      if (currentPage > 1 && currentReviews.length === 1) {
        setCurrentPage((page) => page - 1);
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#050608]">
        <div className="border-t-sapphire-400 size-6 animate-spin rounded-full border-2 border-white/10" />
      </div>
    );
  }

  return (
    <main className={cn("min-h-screen w-full", "bg-[#050608] text-white")}>
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Revisões</h1>

          <p className="mt-1 text-sm text-white/35">
            Histórico de todas as suas análises de código.
          </p>
        </header>

        {sortedReviews.length === 0 ? (
          <section
            className={cn(
              "flex min-h-64 items-center justify-center",
              "rounded-2xl border border-white/6",
              "bg-white/2.5",
            )}
          >
            <div className="text-center">
              <FiFileText className="mx-auto mb-3 text-2xl text-white/15" />

              <p className="text-sm text-white/50">
                Você ainda não possui nenhuma revisão.
              </p>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className={cn(
                  "mt-4 cursor-pointer rounded-xl",
                  "bg-sapphire-400/10 px-4 py-2",
                  "text-sapphire-300 text-sm",
                  "hover:bg-sapphire-400/15 transition",
                )}
              >
                Criar revisão
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentReviews.map((review) => {
                const status = statusConfig[review.status];

                return (
                  <article
                    key={review.id}
                    className={cn(
                      "group relative cursor-pointer",
                      "rounded-2xl border border-white/6",
                      "bg-white/2.5 p-5",
                      "transition",
                      "hover:border-white/10 hover:bg-white/5",
                    )}
                    onClick={() => navigate(`/reviews/${review.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-medium text-white/85">
                          {review.title}
                        </h2>

                        <p className="mt-1 truncate text-xs text-white/30">
                          {review.language}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "shrink-0 rounded-lg px-2.5 py-1",
                          "text-[11px] font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-white/25">
                        <FiClock />

                        <span>{formatDateFull(review.created_at)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => handleDelete(event, review.id)}
                        className={cn(
                          "cursor-pointer rounded-lg p-2",
                          "text-white/20 transition",
                          "hover:bg-red-400/10",
                          "hover:text-red-300",
                        )}
                        aria-label={`Excluir revisão ${review.title}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-2"
                aria-label="Paginação das revisões"
              >
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "size-9 cursor-pointer rounded-xl",
                      "text-sm transition",
                      page === currentPage
                        ? ["bg-sapphire-400/10", "text-sapphire-300"]
                        : [
                            "text-white/30",
                            "hover:bg-white/5",
                            "hover:text-white/70",
                          ],
                    )}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
