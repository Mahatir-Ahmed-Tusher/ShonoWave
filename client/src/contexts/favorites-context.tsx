import { createContext, useContext, useState, useEffect } from "react";
import { Station } from "@shared/schema";

interface FavoritesContextType {
  favorites: Station[];
  addToFavorites: (station: Station) => void;
  removeFromFavorites: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Station[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('shonowave-favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
        localStorage.removeItem('shonowave-favorites');
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shonowave-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (station: Station) => {
    setFavorites(prev => {
      // Avoid duplicates
      if (prev.some(fav => fav.stationuuid === station.stationuuid)) {
        return prev;
      }
      return [...prev, station];
    });
  };

  const removeFromFavorites = (stationId: string) => {
    setFavorites(prev => prev.filter(fav => fav.stationuuid !== stationId));
  };

  const isFavorite = (stationId: string) => {
    return favorites.some(fav => fav.stationuuid === stationId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}