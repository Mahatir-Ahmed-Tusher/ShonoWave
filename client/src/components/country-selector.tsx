import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchCountries, fetchLanguages } from "@/lib/radio-api";
import { cn } from "@/lib/utils";

interface CountryLanguage {
  name: string;
  code?: string;
  stationcount: number;
}

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

// Popular countries to show first
const POPULAR_COUNTRIES = [
  'United States',
  'Germany',
  'France', 
  'United Kingdom',
  'Canada',
  'Australia',
  'Bangladesh',
  'India',
  'Brazil',
  'Japan',
  'Italy',
  'Spain',
  'Netherlands',
  'Mexico',
  'Russia'
];

export function CountrySelector({ 
  selectedCountry, 
  onCountryChange, 
  selectedLanguage, 
  onLanguageChange 
}: CountrySelectorProps) {
  const [searchCountry, setSearchCountry] = useState("");
  const [searchLanguage, setSearchLanguage] = useState("");

  // Fetch countries and languages
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: fetchCountries,
  });

  const { data: languages = [], isLoading: loadingLanguages } = useQuery({
    queryKey: ["/api/languages"],
    queryFn: fetchLanguages,
  });

  // Filter and sort countries
  const filteredCountries = countries
    .filter((country: CountryLanguage) => 
      country.name.toLowerCase().includes(searchCountry.toLowerCase()) &&
      country.stationcount > 0
    )
    .sort((a: CountryLanguage, b: CountryLanguage) => {
      // Show popular countries first
      const aIsPopular = POPULAR_COUNTRIES.includes(a.name);
      const bIsPopular = POPULAR_COUNTRIES.includes(b.name);
      
      if (aIsPopular && !bIsPopular) return -1;
      if (!aIsPopular && bIsPopular) return 1;
      
      // Then sort by station count (descending)
      return b.stationcount - a.stationcount;
    });

  // Filter and sort languages  
  const filteredLanguages = languages
    .filter((language: CountryLanguage) => 
      language.name.toLowerCase().includes(searchLanguage.toLowerCase()) &&
      language.stationcount > 0
    )
    .sort((a: CountryLanguage, b: CountryLanguage) => b.stationcount - a.stationcount)
    .slice(0, 50); // Limit to top 50 languages

  const getCountryFlag = (country: string) => {
    const flagMap: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Bangladesh': '🇧🇩',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Japan': '🇯🇵',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Mexico': '🇲🇽',
      'Russia': '🇷🇺',
      'Poland': '🇵🇱',
      'Turkey': '🇹🇷',
      'South Korea': '🇰🇷',
      'Argentina': '🇦🇷',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Belgium': '🇧🇪',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Ireland': '🇮🇪',
      'Portugal': '🇵🇹',
      'Greece': '🇬🇷',
      'Czech Republic': '🇨🇿',
      'Hungary': '🇭🇺',
      'Romania': '🇷🇴',
      'Croatia': '🇭🇷',
      'Serbia': '🇷🇸',
      'Slovenia': '🇸🇮',
      'Slovakia': '🇸🇰',
      'Bulgaria': '🇧🇬',
      'Lithuania': '🇱🇹',
      'Latvia': '🇱🇻',
      'Estonia': '🇪🇪'
    };
    return flagMap[country] || '🌍';
  };

  return (
    <section className="glass dark:glass-dark backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Country Selector */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">
              Country
            </label>
            <Select 
              value={selectedCountry} 
              onValueChange={onCountryChange}
              disabled={loadingCountries}
            >
              <SelectTrigger 
                className="w-full glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sw-primary/50 dark:hover:border-sw-primary/50 transition-all duration-200 h-12 text-slate-700 dark:text-slate-200"
                data-testid="select-country"
              >
                <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"}>
                  {selectedCountry && (
                    <span className="flex items-center gap-2 font-medium">
                      {getCountryFlag(selectedCountry)} {selectedCountry}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-80 glass dark:glass-dark backdrop-blur-xl border-2 border-slate-300 dark:border-slate-600">
                <div className="p-3 border-b border-slate-300 dark:border-slate-600">
                  <Input
                    placeholder="Search countries..."
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="h-9 glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <SelectItem value="All" className="hover:bg-white/20 dark:hover:bg-white/10">
                  <span className="flex items-center gap-2 font-medium">
                    🌍 All Countries
                  </span>
                </SelectItem>
                {filteredCountries.slice(0, 100).map((country: CountryLanguage, index) => (
                  <SelectItem key={`${country.name}-${index}`} value={country.name} className="hover:bg-white/20 dark:hover:bg-white/10">
                    <span className="flex items-center gap-2 justify-between w-full">
                      <span className="flex items-center gap-2 font-medium">
                        {getCountryFlag(country.name)} {country.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                        {country.stationcount}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Selector */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">
              Language
            </label>
            <Select 
              value={selectedLanguage} 
              onValueChange={onLanguageChange}
              disabled={loadingLanguages}
            >
              <SelectTrigger 
                className="w-full glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sw-secondary/50 dark:hover:border-sw-secondary/50 transition-all duration-200 h-12 text-slate-700 dark:text-slate-200"
                data-testid="select-language"
              >
                <SelectValue placeholder={loadingLanguages ? "Loading..." : "Any language"}>
                  <span className="font-medium">
                    {selectedLanguage === "All" ? "Any Language" : selectedLanguage}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-80 glass dark:glass-dark backdrop-blur-xl border-2 border-slate-300 dark:border-slate-600">
                <div className="p-3 border-b border-slate-300 dark:border-slate-600">
                  <Input
                    placeholder="Search languages..."
                    value={searchLanguage}
                    onChange={(e) => setSearchLanguage(e.target.value)}
                    className="h-9 glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <SelectItem value="All" className="hover:bg-white/20 dark:hover:bg-white/10">
                  <span className="flex items-center gap-2 font-medium">
                    🗣️ Any Language
                  </span>
                </SelectItem>
                {filteredLanguages.map((language: CountryLanguage) => (
                  <SelectItem key={language.name} value={language.name} className="hover:bg-white/20 dark:hover:bg-white/10">
                    <span className="flex items-center justify-between w-full">
                      <span className="font-medium">{language.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                        {language.stationcount}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Access Buttons */}
          <div className="flex flex-wrap gap-3 sm:flex-col sm:w-auto">
            <Button
              variant={selectedCountry === "Bangladesh" ? "default" : "outline"}
              size="sm"
              onClick={() => onCountryChange("Bangladesh")}
              className={`flex items-center gap-2 h-10 px-4 font-semibold transition-all duration-200 ${
                selectedCountry === "Bangladesh" 
                  ? "bg-gradient-to-r from-sw-primary to-sw-secondary text-white shadow-lg hover:shadow-sw-primary/25" 
                  : "glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sw-primary/50 dark:hover:border-sw-primary/50 text-slate-700 dark:text-slate-200"
              }`}
              data-testid="button-quick-bangladesh"
            >
              🇧🇩 BD
            </Button>
            <Button
              variant={selectedCountry === "India" ? "default" : "outline"}
              size="sm"
              onClick={() => onCountryChange("India")}
              className={`flex items-center gap-2 h-10 px-4 font-semibold transition-all duration-200 ${
                selectedCountry === "India" 
                  ? "bg-gradient-to-r from-sw-secondary to-sw-accent text-white shadow-lg hover:shadow-sw-secondary/25" 
                  : "glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sw-secondary/50 dark:hover:border-sw-secondary/50 text-slate-700 dark:text-slate-200"
              }`}
              data-testid="button-quick-india"
            >
              🇮🇳 IN
            </Button>
            <Button
              variant={selectedCountry === "United States" ? "default" : "outline"}
              size="sm"
              onClick={() => onCountryChange("United States")}
              className={`flex items-center gap-2 h-10 px-4 font-semibold transition-all duration-200 ${
                selectedCountry === "United States" 
                  ? "bg-gradient-to-r from-sw-accent to-sw-primary text-white shadow-lg hover:shadow-sw-accent/25" 
                  : "glass dark:glass-dark backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sw-accent/50 dark:hover:border-sw-accent/50 text-slate-700 dark:text-slate-200"
              }`}
              data-testid="button-quick-usa"
            >
              🇺🇸 US
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}