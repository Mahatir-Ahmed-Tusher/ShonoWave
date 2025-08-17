import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Station } from "@shared/schema";
import { setupMediaSession, clearMediaSession } from "@/lib/media-session";
import { useToast } from "@/hooks/use-toast";

interface AudioContextType {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  playStation: (station: Station) => void;
  pauseStation: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  retry: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    // Audio event listeners
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      const errorMessage = audio.error?.message || "Failed to load audio stream";
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Auto-retry once after 2 seconds
      if (retryTimeoutRef.current === null) {
        retryTimeoutRef.current = setTimeout(() => {
          console.log("Auto-retrying stream...");
          retry();
        }, 2000);
      }
      
      toast({
        title: "Stream Error",
        description: "Failed to load stream. Retrying...",
        variant: "destructive",
      });
    };

    const handleStalled = () => {
      setIsLoading(true);
      toast({
        title: "Connection Issue",
        description: "Stream is buffering...",
      });
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("loadstart", handleLoadStart);

    // Set initial volume
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
      audio.removeEventListener("loadstart", handleLoadStart);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      audio.pause();
      audio.src = "";
    };
  }, [volume, toast]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const playStation = useCallback(async (station: Station) => {
    if (!audioRef.current) return;

    // Clear any retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setCurrentStation(station);
    setError(null);
    setIsLoading(true);

    // Use url_resolved first, fallback to url
    const originalUrl = station.url_resolved || station.url;
    
    if (!originalUrl) {
      setError("No stream URL available");
      setIsLoading(false);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a valid stream URL",
        variant: "destructive",
      });
      return;
    }

    // Function to try direct stream first, then proxy
    const tryPlayStream = async (useProxy: boolean = false) => {
      try {
        let streamUrl: string;
        
        if (useProxy) {
          // Use our server proxy for problematic streams
          streamUrl = `/api/stream/${station.stationuuid}?url=${encodeURIComponent(originalUrl)}`;
        } else {
          // Try direct stream first
          streamUrl = originalUrl;
        }

        // Check stream health first if using proxy
        if (useProxy) {
          const healthCheck = await fetch(`/api/stream/check/${station.stationuuid}?url=${encodeURIComponent(originalUrl)}`);
          const healthData = await healthCheck.json();
          
          if (!healthData.healthy) {
            throw new Error(`Stream is not accessible: ${healthData.message}`);
          }
        }

        audioRef.current!.src = streamUrl;
        await audioRef.current!.play();
        
        // Setup media session
        setupMediaSession(station, {
          play: () => togglePlayPause(),
          pause: () => togglePlayPause(),
          stop: () => pauseStation(),
        });
        
        toast({
          title: "Now Playing",
          description: station.name,
        });
        
        return true; // Success
      } catch (error) {
        console.error(`Failed to play ${useProxy ? 'proxied' : 'direct'} stream:`, error);
        return false; // Failed
      }
    };

    try {
      // First, try direct stream
      const directSuccess = await tryPlayStream(false);
      
      if (!directSuccess) {
        // If direct failed, try with proxy
        const proxySuccess = await tryPlayStream(true);
        
        if (!proxySuccess) {
          // Both failed
          throw new Error("Stream is not accessible through direct connection or proxy");
        }
      }
    } catch (err) {
      console.error("Failed to play station:", err);
      setError("Failed to play station");
      setIsLoading(false);
      setIsPlaying(false);
      
      const errorMessage = err instanceof Error ? err.message : "Could not start playback. The station may be offline.";
      
      toast({
        title: "Playback Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const pauseStation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    clearMediaSession();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      pauseStation();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Failed to resume playback:", err);
        setError("Failed to resume playback");
        toast({
          title: "Playback Error",
          description: "Could not resume playback",
          variant: "destructive",
        });
      });
    }
  }, [isPlaying, currentStation, pauseStation, toast]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume / 100;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const retry = useCallback(() => {
    if (currentStation) {
      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Try alternative URL if available
      const alternativeUrl = currentStation.url !== currentStation.url_resolved 
        ? currentStation.url 
        : currentStation.url_resolved;
        
      if (alternativeUrl && alternativeUrl !== audioRef.current?.src) {
        const stationWithAltUrl = { ...currentStation, url_resolved: alternativeUrl };
        playStation(stationWithAltUrl);
      } else {
        playStation(currentStation);
      }
    }
  }, [currentStation, playStation]);



  const value: AudioContextType = {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    playStation,
    pauseStation,
    togglePlayPause,
    setVolume,
    toggleMute,
    retry,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
