import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "ab-theme";

function currentTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Read the class set by the no-flash inline script in index.html
  useEffect(() => setTheme(currentTheme()), []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
      className={
        "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-card text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-600 " +
        (className ?? "")
      }
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
