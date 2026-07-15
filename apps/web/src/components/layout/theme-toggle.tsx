"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else if (t === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }
  }

  function cycle() {
    const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  }

  const icons: Record<Theme, string> = {
    light: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
    dark: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    system: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z M8 21h8 M12 15v6",
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
      title={`Thème : ${theme === "system" ? "auto" : theme === "light" ? "clair" : "sombre"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icons[theme].split(" M").map((d, i) => (
          <path key={i} d={i === 0 ? d : `M${d}`} />
        ))}
      </svg>
    </button>
  );
}
