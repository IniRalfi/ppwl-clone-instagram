import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/theme.store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"}
      className="p-2 rounded-lg hover:bg-ig-secondary-bg transition-colors text-ig-text"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
