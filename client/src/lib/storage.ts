import { FavoriteStation } from "@shared/schema";

const FAVORITES_KEY = "radio-favorites";
const LAST_PLAYED_KEY = "radio-last-played";
const SETTINGS_KEY = "radio-settings";

export interface AppSettings {
  theme: "light" | "dark";
  volume: number;
  lastCountry: string;
  autoplay: boolean;
}

export const storageUtils = {
  // Favorites
  getFavorites(): FavoriteStation[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get favorites from storage:", error);
      return [];
    }
  },

  setFavorites(favorites: FavoriteStation[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to storage:", error);
    }
  },

  addFavorite(favorite: FavoriteStation): void {
    const favorites = this.getFavorites();
    const exists = favorites.some(f => f.stationuuid === favorite.stationuuid);
    
    if (!exists) {
      favorites.push(favorite);
      this.setFavorites(favorites);
    }
  },

  removeFavorite(stationUuid: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(f => f.stationuuid !== stationUuid);
    this.setFavorites(filtered);
  },

  isFavorite(stationUuid: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f => f.stationuuid === stationUuid);
  },

  // Last played station
  getLastPlayed(): string | null {
    try {
      return localStorage.getItem(LAST_PLAYED_KEY);
    } catch (error) {
      console.error("Failed to get last played from storage:", error);
      return null;
    }
  },

  setLastPlayed(stationUuid: string): void {
    try {
      localStorage.setItem(LAST_PLAYED_KEY, stationUuid);
    } catch (error) {
      console.error("Failed to save last played to storage:", error);
    }
  },

  // App settings
  getSettings(): Partial<AppSettings> {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Failed to get settings from storage:", error);
      return {};
    }
  },

  setSettings(settings: Partial<AppSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save settings to storage:", error);
    }
  },

  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(LAST_PLAYED_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  },
};
