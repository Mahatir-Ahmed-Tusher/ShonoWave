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
  isRecording: boolean;
  recordedChunks: Blob[];
  playStation: (station: Station) => void;
  pauseStation: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  retry: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  downloadRecording: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
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
    const streamUrl = station.url_resolved || station.url;
    
    if (!streamUrl) {
      setError("No stream URL available");
      setIsLoading(false);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a valid stream URL",
        variant: "destructive",
      });
      return;
    }

    try {
      audioRef.current.src = streamUrl;
      await audioRef.current.play();
      
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
    } catch (err) {
      console.error("Failed to play station:", err);
      setError("Failed to play station");
      setIsLoading(false);
      setIsPlaying(false);
      
      toast({
        title: "Playback Error",
        description: "Could not start playback. The station may be offline.",
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

  // Recording functions
  const startRecording = useCallback(async () => {
    if (!audioRef.current || !isPlaying || isRecording) return;

    try {
      // Create a stream from the audio element for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioRef.current);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination); // Keep playing through speakers

      const stream = destination.stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedChunks([]);

      toast({
        title: "Recording Started",
        description: `Recording ${currentStation?.name || 'radio stream'}`,
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [audioRef, isPlaying, isRecording, currentStation, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      toast({
        title: "Recording Stopped",
        description: "Your recording is ready to download",
      });
    }
  }, [isRecording, toast]);

  const downloadRecording = useCallback(() => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `ShonoWave_${currentStation?.name || 'Recording'}_${timestamp}.webm`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: `Saved as ${filename}`,
    });

    // Clear recorded chunks
    setRecordedChunks([]);
  }, [recordedChunks, currentStation, toast]);

  const value: AudioContextType = {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    isRecording,
    recordedChunks,
    playStation,
    pauseStation,
    togglePlayPause,
    setVolume,
    toggleMute,
    retry,
    startRecording,
    stopRecording,
    downloadRecording,
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
