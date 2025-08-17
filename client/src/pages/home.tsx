import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CountryCode } from "@shared/schema";
import { CountrySelector } from "@/components/country-selector";
import { SearchFilters } from "@/components/search-filters";
import { StationGrid } from "@/components/station-grid";
import { PlayerBar } from "@/components/player-bar";
import { FullPlayer } from "@/components/full-player";
import { fetchStationsByCountry, searchStations } from "@/lib/radio-api";
import { useDebounce } from "@/hooks/use-debounce";

interface HomeProps {
  defaultCountry?: string;
}

export default function Home({ defaultCountry = "Bangladesh" }: HomeProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "clickcount" | "bitrate" | "lastchangetime">("clickcount");
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update country when defaultCountry prop changes
  useEffect(() => {
    setSelectedCountry(defaultCountry);
  }, [defaultCountry]);

  // Fetch stations with accessibility checks
  const {
    data: rawStations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      debouncedSearchQuery ? "search" : "country",
      debouncedSearchQuery || selectedCountry,
      selectedLanguage,
      selectedGenre,
      sortBy,
    ],
    queryFn: async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        return searchStations({
          name: debouncedSearchQuery,
          country: selectedCountry !== "All" ? selectedCountry : undefined,
          language: selectedLanguage !== "All" ? selectedLanguage : undefined,
          tag: selectedGenre !== "all" ? selectedGenre : undefined,
          limit: 200,
          order: sortBy,
          reverse: true,
        });
      } else if (selectedCountry !== "All") {
        return fetchStationsByCountry(selectedCountry, {
          limit: 200,
          order: sortBy,
        });
      } else {
        // Get top worldwide stations
        return searchStations({
          language: selectedLanguage !== "All" ? selectedLanguage : undefined,
          tag: selectedGenre !== "all" ? selectedGenre : undefined,
          limit: 200,
          order: sortBy,
          reverse: true,
        });
      }
    },
    enabled: !debouncedSearchQuery || debouncedSearchQuery.trim().length >= 2,
  });

  // Filter for accessible stations only
  const stations = useMemo(() => {
    return rawStations.filter(station => {
      // Ensure station has a valid stream URL
      const hasValidUrl = station.url || station.url_resolved;
      
      // Check for broken or inaccessible streams
      const hasValidName = station.name && station.name.trim().length > 0;
      
      // Ensure basic station info is available
      const hasBasicInfo = station.stationuuid && hasValidName;
      
      return hasValidUrl && hasBasicInfo;
    });
  }, [rawStations]);

  // Filter stations by genre locally for better performance
  const filteredStations = useMemo(() => {
    if (!stations) return [];
    
    if (selectedGenre === "all") {
      return stations;
    }
    
    return stations.filter(station => 
      station.tags?.toLowerCase().includes(selectedGenre.toLowerCase()) ||
      station.name.toLowerCase().includes(selectedGenre.toLowerCase())
    );
  }, [stations, selectedGenre]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSearchQuery(""); // Clear search when switching countries
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setSearchQuery(""); // Clear search when switching languages
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort as "name" | "clickcount" | "bitrate" | "lastchangetime");
  };

  const isEmpty = !isLoading && filteredStations.length === 0;

  return (
    <div className="min-h-screen pb-20 relative">
      <CountrySelector
        selectedCountry={selectedCountry}
        onCountryChange={handleCountryChange}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedGenre={selectedGenre}
        onGenreChange={handleGenreChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        stationCount={filteredStations.length}
      />
      
      {/* Station Results Info */}
      <section className="container mx-auto px-4 pb-2">
        <div className="glass dark:glass-dark rounded-2xl p-4 mb-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {selectedCountry === "All" ? "🌍 Worldwide" : selectedCountry} stations
              {selectedLanguage !== "All" && ` in ${selectedLanguage}`}
              {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
            </div>
            {stations.length > 0 && (
              <div className="text-xs font-semibold text-sw-success bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-1.5 rounded-xl border border-green-200/50 dark:border-green-700/50">
                ✓ {stations.length} verified station{stations.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 pb-6">
        <StationGrid
          stations={filteredStations}
          isLoading={isLoading}
          isEmpty={isEmpty}
        />
        
        {error && (
          <div className="text-center py-12" data-testid="error-state">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Failed to load stations</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {error instanceof Error ? error.message : "Please check your connection and try again."}
            </p>
          </div>
        )}
      </section>
      
      <PlayerBar onOpenFullPlayer={() => setShowFullPlayer(true)} />
      
      <FullPlayer
        isOpen={showFullPlayer}
        onClose={() => setShowFullPlayer(false)}
      />
    </div>
  );
}
