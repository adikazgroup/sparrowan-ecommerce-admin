"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuLaptop, LuMoon, LuSun } from "react-icons/lu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Retrieve theme from localStorage on component mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  if (!mounted) {
    return <div className="h-10 w-full bg-neutral-800 animate-pulse"></div>;
  }

  return (
    <div className="w-full  py-2">
      <div className="flex w-full border border-gray-200/50 dark:border-[#3f475a] rounded overflow-hidden text-xs">
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center gap-2 flex-1 py-2 px-1 transition-colors ${
            theme === "light"
              ? "bg-[#0067D2] text-white font-medium"
              : "dark:bg-[#161F2D] bg-gray-50 text-gray-400 dark:hover:bg-[#363d4b] hover:bg-gray-100"
          }`}
        >
          <LuSun className="w-4 h-4" />
          <span>Light</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-center gap-2 flex-1 py-2 px-2 transition-colors ${
            theme === "dark"
              ? "bg-[#0067D2] text-white font-medium"
              : "dark:bg-[#161F2D] bg-gray-50 text-gray-400 dark:hover:bg-[#363d4b] hover:bg-gray-100"
          }`}
        >
          <LuMoon className="w-4 h-4" />
          <span>Dark</span>
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex items-center justify-center gap-2 flex-1 py-2 px-2 transition-colors ${
            theme === "system"
              ? "bg-[#0067D2] text-white font-medium"
              : "dark:bg-[#161F2D] bg-gray-50 text-gray-400 dark:hover:bg-[#363d4b] hover:bg-gray-100"
          }`}
        >
          <LuLaptop className="w-4 h-4" />
          <span>System</span>
        </button>
      </div>
    </div>
  );
}
