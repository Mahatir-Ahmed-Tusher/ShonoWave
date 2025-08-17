import { Station } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { useFavorites } from "@/contexts/favorites-context";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: Station;
  isCurrentStation?: boolean;
}

export function StationCard({ station, isCurrentStation }: StationCardProps) {
  const { playStation, currentStation, isPlaying } = useAudio();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  const isStationFavorited = isFavorite(station.stationuuid);
  const isPlaying_ = isCurrentStation && isPlaying;
  
  const handlePlay = () => {
    playStation(station);
  };

  const handleFavoriteToggle = () => {
    if (isStationFavorited) {
      removeFavorite(station.stationuuid);
    } else {
      addFavorite(station);
    }
  };

  const getCountryFlag = (country: string) => {
    switch (country.toLowerCase()) {
      case 'bangladesh':
        return '🇧🇩';
      case 'india':
        return '🇮🇳';
      default:
        return '🌍';
    }
  };

  const getPrimaryColor = (country: string) => {
    switch (country.toLowerCase()) {
      case 'bangladesh':
        return 'bg-bd-primary hover:bg-bd-primary/90';
      case 'india':
        return 'bg-in-primary hover:bg-in-primary/90';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const getCountryBadgeColor = (country: string) => {
    switch (country.toLowerCase()) {
      case 'bangladesh':
        return 'bg-bd-primary/10 text-bd-primary';
      case 'india':
        return 'bg-in-primary/10 text-in-primary';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-md hover:scale-[1.02] transition-all duration-200 group",
        isCurrentStation && "ring-2 ring-primary ring-opacity-50"
      )}
      data-testid={`card-station-${station.stationuuid}`}
    >
      <div className="flex items-start gap-3">
        {/* Station Logo */}
        <img
          src={station.favicon || "/fallback-favicon.png"}
          alt={`${station.name} logo`}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-600"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/fallback-favicon.png";
          }}
        />
        
        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-sm line-clamp-2 transition-colors",
            station.country.toLowerCase() === 'bangladesh' ? "group-hover:text-bd-primary" : "group-hover:text-in-primary"
          )}>
            {station.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {station.tags || "Radio Station"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              getCountryBadgeColor(station.country)
            )}>
              {getCountryFlag(station.country)} {station.country.substring(0, 2).toUpperCase()}
            </span>
            {station.bitrate && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {station.bitrate} kbps
              </span>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={handlePlay}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110",
              getPrimaryColor(station.country),
              "text-white"
            )}
            data-testid={`button-play-${station.stationuuid}`}
          >
            <i className={cn(
              "text-xs",
              isPlaying_ ? "fas fa-pause" : "fas fa-play ml-0.5"
            )}></i>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              isStationFavorited 
                ? "text-red-500 hover:text-red-600" 
                : "text-slate-400 hover:text-red-500"
            )}
            data-testid={`button-favorite-${station.stationuuid}`}
          >
            <i className={cn(
              "text-sm",
              isStationFavorited ? "fas fa-heart" : "far fa-heart"
            )}></i>
          </Button>
        </div>
      </div>
      
      {/* Playing Animation */}
      {isPlaying_ && (
        <div className="flex items-center gap-1 mt-2 ml-2">
          <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '12px', animationDelay: '0ms' }}></div>
          <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '20px', animationDelay: '100ms' }}></div>
          <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '16px', animationDelay: '200ms' }}></div>
          <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '24px', animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
}
