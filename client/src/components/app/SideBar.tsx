import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiClock, FiCode, FiHome, FiLogOut } from "react-icons/fi";

import { useUser } from "../../contexts/UserContext";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";
import { getReviews } from "../../services/reviews.service";

const navigation = [
  {
    label: "Início",
    to: "/home",
    icon: FiHome,
  },
  {
    label: "Revisões",
    to: "/reviews",
    icon: FiClock,
  },
];

type ReviewHistory = {
  id: number;
  title: string;
};

export default function SideBar() {
  const { user } = useUser();
  const { logout } = useAuth();

  const [reviews, setReviews] = useState<ReviewHistory[]>([]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const reviews = await getReviews();
        setReviews(reviews);
      } catch (error) {
        console.error("Get reviews error:", error);
      }
    }

    loadReviews();

    window.addEventListener("reviews:updated", loadReviews);

    return () => {
      window.removeEventListener("reviews:updated", loadReviews);
    };
  }, []);

  async function handleLogout() {
    logout();
  }

  return (
    <aside
      className={cn(
        "fixed flex h-screen w-64 shrink-0 flex-col",
        "border-r border-white/6",
        "bg-[#07090e]",
      )}
    >
      <div className="flex h-16 items-center border-b border-white/6 px-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center",
              "border-sapphire-400/20 rounded-xl border",
              "bg-sapphire-400/10",
            )}
          >
            <FiCode className="text-sapphire-400 text-lg" />
          </div>

          <div>
            <p className="text-md font-semibold tracking-tight text-white">
              Code Cross
            </p>

            <p className="text-[11px] text-white/25">
              Análise de código por IA
            </p>
          </div>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-wider text-white/20 uppercase">
          Principal
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3",
                    "rounded-xl px-3 py-2.5",
                    "text-sm transition",
                    isActive
                      ? ["bg-sapphire-400/10", "text-sapphire-300"]
                      : [
                          "text-white/40",
                          "hover:bg-white/5",
                          "hover:text-white/75",
                        ],
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "text-base transition",
                        isActive
                          ? "text-sapphire-400"
                          : "text-white/25 group-hover:text-white/50",
                      )}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="my-5 border-t border-white/6" />

        <p className="mb-3 px-3 text-[10px] font-semibold tracking-wider text-white/20 uppercase">
          Histórico
        </p>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {reviews.map((review) => (
            <NavLink
              key={review.id}
              to={`/reviews/${review.id}`}
              className={({ isActive }) =>
                cn(
                  "block truncate rounded-xl px-3 py-2",
                  "text-sm transition",
                  isActive
                    ? ["bg-sapphire-400/10", "text-sapphire-300"]
                    : [
                        "text-white/35",
                        "hover:bg-white/5",
                        "hover:text-white/70",
                      ],
                )
              }
            >
              {review.title}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/6 p-3">
        <div
          className={cn("flex items-center gap-3", "rounded-xl px-3 py-2.5")}
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center",
              "bg-sapphire-400/10 rounded-full",
              "text-sapphire-300 text-sm font-semibold",
            )}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-md truncate font-medium text-white/75">
              {user?.username}
            </p>

            <p className="truncate text-[12px] text-white/25">Conta</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "mt-1 flex w-full items-center gap-3",
            "cursor-pointer rounded-xl px-3 py-2.5",
            "text-sm text-white/35",
            "transition",
            "hover:bg-red-400/5",
            "hover:text-red-300",
          )}
        >
          <FiLogOut className="text-white/25" />
          Sair
        </button>
      </div>
    </aside>
  );
}
