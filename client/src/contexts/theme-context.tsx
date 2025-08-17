import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Get system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  // Update actual theme based on theme setting
  useEffect(() => {
    const updateActualTheme = () => {
      let newActualTheme: "light" | "dark";
      
      if (theme === "system") {
        newActualTheme = getSystemTheme();
      } else {
        newActualTheme = theme;
      }
      
      setActualTheme(newActualTheme);
      
      // Update document class
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newActualTheme);
    };

    updateActualTheme();

    // Listen for system theme changes if using system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateActualTheme();
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("shonowave-theme") as Theme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("shonowave-theme", newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        actualTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}