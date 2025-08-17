import { useAudio } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PlayerBarProps {
  onOpenFullPlayer: () => void;
}

export function PlayerBar({ onOpenFullPlayer }: PlayerBarProps) {
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    togglePlayPause,
    setVolume,
    toggleMute,
    retry,
    error,
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentStation) return null;

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur-sm border-t border-slate-200 dark:border-dark-border z-50 transform transition-transform duration-300 animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Current Station Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={currentStation.favicon || "/fallback-favicon.png"}
              alt={`${currentStation.name} logo`}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/fallback-favicon.png";
              }}
            />
            
            {/* Playing Animation Bars */}
            {isPlaying && !isLoading && !error && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '12px', animationDelay: '0ms' }}></div>
                <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '20px', animationDelay: '100ms' }}></div>
                <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '16px', animationDelay: '200ms' }}></div>
                <div className="w-1 bg-bd-primary rounded-full animate-bounce-gentle" style={{ height: '24px', animationDelay: '300ms' }}></div>
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate" data-testid="text-current-station-name">
                {currentStation.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {isLoading && "Loading..."}
                {error && "Connection error"}
                {!isLoading && !error && (currentStation.tags || `${getCountryFlag(currentStation.country)} ${currentStation.country}`)}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            {/* Volume Control (Desktop Only) */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                data-testid="button-mute"
              >
                <i className={cn(
                  "text-slate-600 dark:text-slate-300 text-sm",
                  isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"
                )}></i>
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-20"
                data-testid="slider-volume"
              />
            </div>

            {/* Error Retry Button */}
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
                className="text-xs px-2 py-1"
                data-testid="button-retry"
              >
                Retry
              </Button>
            )}

            {/* Main Play/Pause Button */}
            <Button
              onClick={togglePlayPause}
              disabled={isLoading}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 text-white",
                getPrimaryColor(currentStation.country)
              )}
              data-testid="button-main-play-pause"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin text-sm"></i>
              ) : (
                <i className={cn(
                  "text-sm",
                  isPlaying ? "fas fa-pause" : "fas fa-play ml-0.5"
                )}></i>
              )}
            </Button>

            {/* Full Player Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenFullPlayer}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
              data-testid="button-open-full-player"
            >
              <i className="fas fa-expand-alt text-slate-600 dark:text-slate-300 text-sm"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
