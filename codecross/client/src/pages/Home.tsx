import { useState } from "react";
import { FiCode, FiFileText, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import LanguageDropdown, {
  LANGUAGES,
} from "../components/home/LanguageDropdown";
import { cn } from "../utils/cn";

import CodeEditor from "../components/home/CodeEditor";
import { createReview } from "../services/reviews.service";

const ANALYSIS_TYPES = [
  { value: "bug", label: "Bugs" },
  { value: "security", label: "Segurança" },
  { value: "performance", label: "Performance" },
  { value: "quality", label: "Qualidade" },
  { value: "architecture", label: "Arquitetura" },
];

export default function Home() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [filename, setFilename] = useState("script.js");
  const [content, setContent] = useState("");
  const [analysisTypes, setAnalysisTypes] = useState<string[]>([
    "bug",
    "security",
    "performance",
    "quality",
    "architecture",
  ]);
  const [loading, setLoading] = useState(false);

  const isFormValid =
    title.trim().length > 0 &&
    filename.trim().length > 0 &&
    content.trim().length > 0 &&
    analysisTypes.length > 0;

  const toggleAnalysisType = (type: string) => {
    setAnalysisTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  };

  function changeLanguage(newLanguage: string) {
    setLanguage(newLanguage);

    const selectedLanguage = LANGUAGES.find(
      (item) => item.value === newLanguage,
    );

    if (!selectedLanguage) {
      return;
    }

    setFilename((prev) => {
      const lastDotIndex = prev.lastIndexOf(".");

      const filename =
        lastDotIndex > 0 ? prev.slice(0, lastDotIndex) : prev || "script";

      return `${filename}.${selectedLanguage.extension}`;
    });
  }

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if (loading || !isFormValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await createReview({
        title,
        language,
        content,
        filename,
        analysisTypes,
      });

      window.dispatchEvent(new Event("reviews:updated"));

      navigate(`/reviews/${result.reviewId}`);
    } catch (error) {
      console.error("Create review error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen w-full", "text-white")}>
      <div
        className={cn("mx-auto flex w-full max-w-7xl", "flex-col px-6 py-10")}
      >
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center",
                "border-sapphire-400/20 rounded-xl border",
                "bg-sapphire-400/10",
              )}
            >
              <FiCode className="text-sapphire-400 text-lg" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Revisar código
              </h1>

              <p className="mt-1 text-sm text-white/35">
                Envie seu código para uma análise detalhada com IA.
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "border-sapphire-400/10 rounded-3xl border",
              "bg-[#090c14]/95",
              "shadow-2xl shadow-black/30",
              "backdrop-blur-xl",
            )}
          >
            <div
              className={cn(
                "grid gap-5 border-b border-white/6",
                "p-6 md:grid-cols-2",
              )}
            >
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Título da revisão
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Revisão do sistema de autenticação"
                  className={cn(
                    "h-11 w-full rounded-xl",
                    "border border-white/8",
                    "bg-white/2.5",
                    "px-4 text-sm text-white",
                    "outline-none",
                    "placeholder:text-white/20",
                    "transition",
                    "focus:border-sapphire-400/50",
                    "focus:bg-sapphire-400/2.5",
                    "focus:ring-sapphire-400/5 focus:ring-3",
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="filename"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Nome do arquivo
                </label>

                <div className="relative">
                  <FiFileText
                    className={cn(
                      "pointer-events-none absolute left-3.5",
                      "top-1/2 -translate-y-1/2",
                      "text-sm text-white/25",
                    )}
                  />

                  <input
                    id="filename"
                    type="text"
                    value={filename}
                    maxLength={255}
                    onChange={(event) => setFilename(event.target.value)}
                    placeholder="script.js"
                    className={cn(
                      "h-11 w-full rounded-xl",
                      "border border-white/8",
                      "bg-white/2.5",
                      "pr-4 pl-10 text-sm text-white",
                      "outline-none",
                      "placeholder:text-white/20",
                      "transition",
                      "focus:border-sapphire-400/50",
                      "focus:bg-sapphire-400/2.5",
                      "focus:ring-sapphire-400/5 focus:ring-3",
                    )}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Linguagem
                </label>

                <LanguageDropdown
                  selectedLanguage={language}
                  setLanguage={changeLanguage}
                />
              </div>

              <div>
                <span className="mb-2 block text-xs font-medium text-white/55">
                  Tipos de análise
                </span>

                <div className="flex flex-wrap gap-2">
                  {ANALYSIS_TYPES.map((type) => {
                    const selected = analysisTypes.includes(type.value);

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleAnalysisType(type.value)}
                        className={cn(
                          "cursor-pointer rounded-lg border",
                          "px-3 py-2 text-xs font-medium",
                          "transition",
                          selected
                            ? [
                                "border-sapphire-400/30",
                                "bg-sapphire-400/10",
                                "text-sapphire-300",
                              ]
                            : [
                                "border-white/8",
                                "bg-white/2.5",
                                "text-white/40",
                                "hover:border-white/12",
                                "hover:bg-white/5",
                                "hover:text-white/70",
                              ],
                        )}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-white/55">
                  Código
                </label>

                <span className="text-[11px] text-white/20">
                  {content.length.toLocaleString("pt-BR")} caracteres
                </span>
              </div>

              <CodeEditor
                language={language}
                value={content}
                onChange={setContent}
              />

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={cn(
                    "group flex h-11 items-center",
                    "gap-2 rounded-xl px-5",
                    "text-sm font-semibold",
                    "transition",
                    isFormValid && !loading
                      ? [
                          "cursor-pointer",
                          "bg-sapphire-500 text-white",
                          "shadow-[0_0_25px_rgba(59,130,246,0.12)]",
                          "hover:bg-sapphire-400",
                          "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
                          "active:scale-[0.99]",
                        ]
                      : ["cursor-not-allowed", "bg-white/8", "text-white/25"],
                  )}
                >
                  <FiPlay
                    size={15}
                    className={cn(
                      "transition-transform",
                      isFormValid && !loading && "group-hover:translate-x-0.5",
                    )}
                  />

                  {loading ? "Analisando..." : "Analisar código"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
