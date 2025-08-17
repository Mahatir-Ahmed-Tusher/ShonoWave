import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  stationCount: number;
}

const genres = [
  { value: "all", label: "All Genres" },
  { value: "music", label: "Music" },
  { value: "news", label: "News" },
  { value: "talk", label: "Talk" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "classical", label: "Classical" },
  { value: "jazz", label: "Jazz" },
];

const sortOptions = [
  { value: "clickcount", label: "Most Popular" },
  { value: "bitrate", label: "Highest Quality" },
  { value: "name", label: "A-Z" },
  { value: "lastchangetime", label: "Recently Added" },
];

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  stationCount,
}: SearchFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Update parent when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="glass dark:glass-dark backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-400 dark:text-slate-500"></i>
          </div>
          <Input
            type="text"
            placeholder="Search radio stations..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 glass dark:glass-dark backdrop-blur-sm border-white/30 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-sw-primary/50 focus:border-sw-primary/50 transition-all duration-200 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            data-testid="input-search-stations"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <Button
              key={genre.value}
              variant={selectedGenre === genre.value ? "default" : "secondary"}
              size="sm"
              onClick={() => onGenreChange(genre.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                selectedGenre === genre.value
                  ? "bg-gradient-to-r from-sw-primary to-sw-secondary text-white shadow-lg hover:shadow-sw-primary/25"
                  : "glass dark:glass-dark backdrop-blur-sm border-white/30 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:border-sw-primary/50 dark:hover:border-sw-primary/50"
              )}
              data-testid={`filter-${genre.value}`}
            >
              {genre.label}
            </Button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300" data-testid="text-station-count">
            {stationCount} stations found
          </p>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48 glass dark:glass-dark backdrop-blur-sm border-white/30 dark:border-white/20 rounded-xl h-11 text-slate-700 dark:text-slate-200 hover:border-sw-accent/50 dark:hover:border-sw-accent/50 transition-all duration-200" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass dark:glass-dark backdrop-blur-xl border-white/20 dark:border-white/10">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-white/20 dark:hover:bg-white/10">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
