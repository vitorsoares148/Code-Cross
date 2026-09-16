import Editor from "@monaco-editor/react";

import { cn } from "../../utils/cn";

type CodeEditorProps = {
  language: string;
  value: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({
  language,
  value,
  onChange,
}: CodeEditorProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "border border-white/8",
        "bg-[#06080d]",
      )}
    >
      <Editor
        height="477px"
        language={language}
        value={value}
        onChange={(value) => onChange(value ?? "")}
        theme="code-reviewer"
        options={{
          fontSize: 14,
          lineHeight: 24,

          minimap: {
            enabled: false,
          },

          padding: {
            top: 16,
            bottom: 16,
          },

          automaticLayout: true,

          scrollBeyondLastLine: false,

          wordWrap: "off",

          tabSize: 2,

          renderLineHighlight: "line",

          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },

          overviewRulerBorder: false,

          folding: true,

          lineNumbersMinChars: 3,

          fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",

          cursorBlinking: "smooth",

          smoothScrolling: true,
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("code-reviewer", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#06080d",
              "editor.foreground": "#d7dce5",

              "editorLineNumber.foreground": "#303744",
              "editorLineNumber.activeForeground": "#6d7890",

              "editor.lineHighlightBackground": "#0b101a",

              "editor.selectionBackground": "#1d3a66",
              "editor.inactiveSelectionBackground": "#142641",

              "editorCursor.foreground": "#60a5fa",

              "editorIndentGuide.background1": "#111722",
              "editorIndentGuide.activeBackground1": "#1b2638",

              "editorWhitespace.foreground": "#151c28",

              "editorGutter.background": "#06080d",

              "editorWidget.background": "#0b0f18",
              "editorWidget.border": "#1c2638",

              "editorSuggestWidget.background": "#0b0f18",
              "editorSuggestWidget.border": "#1c2638",

              "scrollbarSlider.background": "#182238",
              "scrollbarSlider.hoverBackground": "#24365c",
              "scrollbarSlider.activeBackground": "#2e4a7a",
            },
          });
        }}
      />
    </div>
  );
}
