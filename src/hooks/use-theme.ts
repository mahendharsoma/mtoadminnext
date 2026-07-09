"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("mto-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("mto-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggleTheme, mounted };
}
