import { CountryCode } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface CountryTabsProps {
  activeCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
}

export function CountryTabs({ activeCountry, onCountryChange }: CountryTabsProps) {
  const [location] = useLocation();

  const tabs = [
    {
      country: "Bangladesh" as CountryCode,
      label: "Bangladesh",
      flag: "🇧🇩",
      path: "/bd",
      colorClass: "border-bd-primary text-bd-primary",
    },
    {
      country: "India" as CountryCode,
      label: "India",
      flag: "🇮🇳",
      path: "/in",
      colorClass: "border-in-primary text-in-primary",
    },
  ];

  return (
    <nav className="sticky top-16 z-30 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-slate-200 dark:border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeCountry === tab.country;
            
            return (
              <button
                key={tab.country}
                onClick={() => onCountryChange(tab.country)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors",
                  isActive
                    ? `${tab.colorClass}`
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
                data-testid={`tab-${tab.country.toLowerCase()}`}
              >
                <span className="text-lg">{tab.flag}</span>
                {tab.label}
              </button>
            );
          })}
          
          {/* Favorites Tab */}
          <Link
            href="/favorites"
            className={cn(
              "flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors",
              location === "/favorites"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
            data-testid="tab-favorites"
          >
            <i className="fas fa-heart"></i>
            Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
}
