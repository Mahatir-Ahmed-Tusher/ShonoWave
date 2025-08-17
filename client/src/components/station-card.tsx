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
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  
  const isStationFavorited = isFavorite(station.stationuuid);
  const isPlaying_ = isCurrentStation && isPlaying;
  
  const handlePlay = () => {
    playStation(station);
  };

  const handleFavoriteToggle = () => {
    if (isStationFavorited) {
      removeFromFavorites(station.stationuuid);
    } else {
      addToFavorites(station);
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
        return 'bg-gradient-to-r from-sw-primary to-sw-secondary hover:from-sw-primary/90 hover:to-sw-secondary/90';
      case 'india':
        return 'bg-gradient-to-r from-sw-secondary to-sw-accent hover:from-sw-secondary/90 hover:to-sw-accent/90';
      default:
        return 'bg-gradient-to-r from-sw-accent to-sw-primary hover:from-sw-accent/90 hover:to-sw-primary/90';
    }
  };

  const getCountryBadgeColor = (country: string) => {
    switch (country.toLowerCase()) {
      case 'bangladesh':
        return 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 text-sw-primary border border-sw-primary/20';
      case 'india':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 text-sw-secondary border border-sw-secondary/20';
      default:
        return 'bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 text-sw-accent border border-sw-accent/20';
    }
  };

  return (
    <div
      className={cn(
        "glass dark:glass-dark backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 dark:border-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group",
        isCurrentStation && "ring-2 ring-sw-primary/50 shadow-sw-primary/20"
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
