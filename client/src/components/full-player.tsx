import { useAudio } from "@/contexts/audio-context";
import { useFavorites } from "@/contexts/favorites-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullPlayer({ isOpen, onClose }: FullPlayerProps) {
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
  
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { toast } = useToast();

  if (!currentStation) return null;

  const isStationFavorited = isFavorite(currentStation.stationuuid);

  const handleFavoriteToggle = () => {
    if (isStationFavorited) {
      removeFavorite(currentStation.stationuuid);
    } else {
      addFavorite(currentStation);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentStation.name,
          text: `Listen to ${currentStation.name} - ${currentStation.country}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Station link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Share Error",
          description: "Unable to share station",
          variant: "destructive",
        });
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Now Playing</DialogTitle>
        </DialogHeader>

        {/* Station Artwork & Info */}
        <div className="p-6 text-center">
          {/* Large station artwork */}
          <div className="relative mb-6">
            <img
              src={currentStation.favicon || "/shonowave-logo.png"}
              alt={`${currentStation.name} artwork`}
              className="w-48 h-48 rounded-2xl object-cover mx-auto shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/shonowave-logo.png";
              }}
            />
            
            {/* Live indicator */}
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2" data-testid="text-full-player-station-name">
            {currentStation.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {currentStation.tags || `${getCountryFlag(currentStation.country)} ${currentStation.country}`}
          </p>

          {/* Station Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-slate-500 dark:text-slate-400">Country</div>
              <div className="font-medium">
                {getCountryFlag(currentStation.country)} {currentStation.country}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-slate-500 dark:text-slate-400">Quality</div>
              <div className="font-medium">
                {currentStation.bitrate ? `${currentStation.bitrate} kbps` : "Unknown"}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-slate-500 dark:text-slate-400">Language</div>
              <div className="font-medium">
                {currentStation.language || "Mixed"}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="text-slate-500 dark:text-slate-400">Codec</div>
              <div className="font-medium">
                {currentStation.codec || "MP3"}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {isLoading && (
            <div className="mb-4 text-slate-500 dark:text-slate-400">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading stream...
            </div>
          )}
          
          {error && (
            <div className="mb-4 text-red-500">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          {/* Player Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full"
              disabled
              data-testid="button-previous"
            >
              <i className="fas fa-step-backward text-slate-600 dark:text-slate-300"></i>
            </Button>
            
            <Button
              onClick={togglePlayPause}
              disabled={isLoading}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 text-white",
                getPrimaryColor(currentStation.country)
              )}
              data-testid="button-full-player-play-pause"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin text-xl"></i>
              ) : (
                <i className={cn(
                  "text-xl",
                  isPlaying ? "fas fa-pause" : "fas fa-play ml-1"
                )}></i>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full"
              disabled
              data-testid="button-next"
            >
              <i className="fas fa-step-forward text-slate-600 dark:text-slate-300"></i>
            </Button>
          </div>

          {/* Retry Button */}
          {error && (
            <div className="mb-6">
              <Button
                onClick={retry}
                variant="outline"
                className="mr-2"
                data-testid="button-full-player-retry"
              >
                <i className="fas fa-redo mr-2"></i>
                Retry Stream
              </Button>
            </div>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              data-testid="button-full-player-mute"
            >
              <i className={cn(
                "text-slate-400",
                isMuted ? "fas fa-volume-mute" : "fas fa-volume-down"
              )}></i>
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
              data-testid="slider-full-player-volume"
            />
            
            <Button
              variant="ghost"
              size="sm"
              disabled
            >
              <i className="fas fa-volume-up text-slate-400"></i>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleFavoriteToggle}
              variant="outline"
              className={cn(
                "flex-1 py-3 font-medium transition-colors",
                isStationFavorited
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
              )}
              data-testid="button-full-player-favorite"
            >
              <i className={cn(
                "mr-2",
                isStationFavorited ? "fas fa-heart" : "far fa-heart"
              )}></i>
              {isStationFavorited ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
            
            <Button
              onClick={handleShare}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 font-medium transition-colors"
              data-testid="button-share-station"
            >
              <i className="fas fa-share mr-2"></i>
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
