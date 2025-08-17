import { useState } from "react";
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
  useState(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-400"></i>
          </div>
          <Input
            type="text"
            placeholder="Search radio stations..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="input-search-stations"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Button
              key={genre.value}
              variant={selectedGenre === genre.value ? "default" : "secondary"}
              size="sm"
              onClick={() => onGenreChange(genre.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedGenre === genre.value
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
              data-testid={`filter-${genre.value}`}
            >
              {genre.label}
            </Button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="text-station-count">
            {stationCount} stations found
          </p>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
