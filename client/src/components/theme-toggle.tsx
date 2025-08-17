import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const themes = [
    {
      value: "light" as const,
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: "Dark", 
      icon: Moon,
    },
    {
      value: "system" as const,
      label: "System",
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full transition-all duration-300",
            "glass dark:glass-dark backdrop-blur-sm",
            "border-white/30 dark:border-white/20",
            "hover:border-sw-primary/50 dark:hover:border-sw-primary/50",
            "hover:shadow-lg hover:shadow-sw-primary/20",
            "group"
          )}
          data-testid="button-theme-toggle"
        >
          <CurrentIcon className={cn(
            "h-5 w-5 transition-all duration-300",
            "text-slate-700 dark:text-slate-200",
            "group-hover:text-sw-primary dark:group-hover:text-sw-primary",
            "group-hover:scale-110"
          )} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "glass dark:glass-dark backdrop-blur-xl",
          "border-white/20 dark:border-white/10",
          "shadow-xl shadow-black/10 dark:shadow-black/30"
        )}
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200",
                "hover:bg-white/20 dark:hover:bg-white/10",
                "focus:bg-white/20 dark:focus:bg-white/10",
                isSelected && "bg-sw-primary/10 text-sw-primary"
              )}
              data-testid={`theme-option-${themeOption.value}`}
            >
              <Icon className={cn(
                "h-4 w-4 transition-colors",
                isSelected 
                  ? "text-sw-primary" 
                  : "text-slate-600 dark:text-slate-300"
              )} />
              <span className={cn(
                "font-medium transition-colors",
                isSelected 
                  ? "text-sw-primary" 
                  : "text-slate-700 dark:text-slate-200"
              )}>
                {themeOption.label}
              </span>
              {isSelected && (
                <div className="ml-auto h-2 w-2 rounded-full bg-sw-primary"></div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}