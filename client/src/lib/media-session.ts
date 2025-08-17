import { Station } from "@shared/schema";

interface MediaSessionActions {
  play?: () => void;
  pause?: () => void;
  stop?: () => void;
  seekbackward?: () => void;
  seekforward?: () => void;
  previoustrack?: () => void;
  nexttrack?: () => void;
}

export function setupMediaSession(station: Station, actions: MediaSessionActions) {
  if (!("mediaSession" in navigator)) {
    console.log("Media Session API not supported");
    return;
  }

  // Set metadata
  navigator.mediaSession.metadata = new MediaMetadata({
    title: station.name,
    artist: station.country,
    album: station.tags || "ShonoWave",
    artwork: [
      {
        src: station.favicon || "/shonowave-logo.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: station.favicon || "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: station.favicon || "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  });

  // Set action handlers
  const supportedActions: (keyof MediaSessionActions)[] = [
    "play",
    "pause",
    "stop",
    "seekbackward",
    "seekforward",
    "previoustrack",
    "nexttrack",
  ];

  supportedActions.forEach((action) => {
    if (actions[action]) {
      try {
        navigator.mediaSession.setActionHandler(action, actions[action]);
      } catch (error) {
        console.warn(`Media Session action "${action}" not supported:`, error);
      }
    }
  });

  // Set playback state
  navigator.mediaSession.playbackState = "playing";
}

export function updateMediaSessionPlaybackState(state: "playing" | "paused" | "none") {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = state;
  }
}

export function clearMediaSession() {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = "none";
    
    // Clear all action handlers
    try {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("stop", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    } catch (error) {
      // Some browsers may not support clearing handlers
      console.warn("Error clearing media session handlers:", error);
    }
  }
}
