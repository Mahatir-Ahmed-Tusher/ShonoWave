import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CountryCode } from "@shared/schema";
import { AppHeader } from "@/components/app-header";
import { CountryTabs } from "@/components/country-tabs";
import { SearchFilters } from "@/components/search-filters";
import { StationGrid } from "@/components/station-grid";
import { PlayerBar } from "@/components/player-bar";
import { FullPlayer } from "@/components/full-player";
import { fetchStationsByCountry, searchStations } from "@/lib/radio-api";
import { useDebounce } from "@/hooks/use-debounce";

interface HomeProps {
  defaultCountry?: CountryCode;
}

export default function Home({ defaultCountry = "Bangladesh" }: HomeProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("clickcount");
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update country when defaultCountry prop changes
  useEffect(() => {
    setSelectedCountry(defaultCountry);
  }, [defaultCountry]);

  // Fetch stations based on search query or country
  const {
    data: stations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      debouncedSearchQuery ? "search" : "country",
      debouncedSearchQuery || selectedCountry,
      selectedGenre,
      sortBy,
    ],
    queryFn: async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        return searchStations({
          name: debouncedSearchQuery,
          country: selectedCountry,
          tag: selectedGenre !== "all" ? selectedGenre : undefined,
          limit: 100,
          order: sortBy,
          reverse: true,
        });
      } else {
        return fetchStationsByCountry(selectedCountry, {
          limit: 100,
          order: sortBy,
        });
      }
    },
    enabled: !debouncedSearchQuery || debouncedSearchQuery.trim().length >= 2,
  });

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

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    setSearchQuery(""); // Clear search when switching countries
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const isEmpty = !isLoading && filteredStations.length === 0;

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-dark-bg">
      <AppHeader />
      
      <CountryTabs
        activeCountry={selectedCountry}
        onCountryChange={handleCountryChange}
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
