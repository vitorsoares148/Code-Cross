import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiCode } from "react-icons/fi";

import { cn } from "../../utils/cn";

type Language = {
  value: string;
  label: string;
  extension: string;
};

export const LANGUAGES: Language[] = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "csharp", label: "C#", extension: "cs" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "go", label: "Go", extension: "go" },
  { value: "php", label: "PHP", extension: "php" },
  { value: "sql", label: "SQL", extension: "sql" },
];

type LanguageDropdownProps = {
  selectedLanguage: string;
  setLanguage: (language: string) => void;
};

export default function LanguageDropdown({
  selectedLanguage,
  setLanguage,
}: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected =
    LANGUAGES.find((language) => language.value === selectedLanguage) ??
    LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLanguageChange(language: string) {
    setLanguage(language);
    setOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative w-full select-none">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-11 w-full items-center justify-between",
          "cursor-pointer rounded-xl border",
          "px-4 text-sm text-white",
          "transition",
          open
            ? [
                "border-sapphire-400/40",
                "bg-sapphire-400/5",
                "ring-sapphire-400/5 ring-3",
              ]
            : ["border-white/8", "bg-white/2.5", "hover:border-white/12"],
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FiCode className="shrink-0 text-white/30" />

          <span className="truncate">{selected.label}</span>
        </span>

        <FiChevronDown
          className={cn(
            "shrink-0 text-white/30",
            "transition-transform duration-200",
            open && "text-sapphire-400 rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full left-0 z-50 mt-2 w-full",
            "overflow-hidden rounded-xl p-1",
            "border border-white/8",
            "bg-[#0b0f18]/98",
            "shadow-2xl shadow-black/40",
            "backdrop-blur-xl",
          )}
        >
          <div className="max-h-64 overflow-y-auto p-1">
            {LANGUAGES.map((language) => {
              const isSelected = language.value === selectedLanguage;

              return (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => handleLanguageChange(language.value)}
                  className={cn(
                    "flex w-full items-center justify-between",
                    "cursor-pointer rounded-lg",
                    "px-3 py-2.5 text-left text-sm",
                    "transition",
                    isSelected
                      ? ["bg-sapphire-400/10", "text-sapphire-300"]
                      : [
                          "text-white/60",
                          "hover:bg-white/5",
                          "hover:text-white",
                        ],
                  )}
                >
                  <span>{language.label}</span>

                  {isSelected && <FiCheck className="text-sapphire-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
