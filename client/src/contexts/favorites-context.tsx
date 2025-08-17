import { createContext, useContext, useEffect, useState } from "react";
import { FavoriteStation, Station } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FavoritesContextType {
  favorites: FavoriteStation[];
  isFavorite: (stationUuid: string) => boolean;
  addFavorite: (station: Station) => void;
  removeFavorite: (stationUuid: string) => void;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [localFavorites, setLocalFavorites] = useState<FavoriteStation[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("radio-favorites");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalFavorites(parsed);
      } catch (error) {
        console.error("Failed to parse stored favorites:", error);
      }
    }
  }, []);

  // Sync with localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("radio-favorites", JSON.stringify(localFavorites));
  }, [localFavorites]);

  // Query server favorites (for future sync if needed)
  const { data: serverFavorites, isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: false, // Disabled for now since we're using localStorage
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (station: Station) => {
      const favorite: FavoriteStation = {
        stationuuid: station.stationuuid,
        name: station.name,
        favicon: station.favicon,
        url_resolved: station.url_resolved,
        country: station.country,
        tags: station.tags,
        bitrate: station.bitrate,
        addedAt: new Date().toISOString(),
      };

      // Add to local storage immediately
      setLocalFavorites(prev => {
        const exists = prev.some(f => f.stationuuid === station.stationuuid);
        if (exists) return prev;
        return [...prev, favorite];
      });

      return favorite;
    },
    onSuccess: (favorite) => {
      toast({
        title: "Added to Favorites",
        description: favorite.name,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
      console.error("Failed to add favorite:", error);
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (stationUuid: string) => {
      const favorite = localFavorites.find(f => f.stationuuid === stationUuid);
      
      // Remove from local storage immediately
      setLocalFavorites(prev => prev.filter(f => f.stationuuid !== stationUuid));
      
      return favorite;
    },
    onSuccess: (favorite) => {
      toast({
        title: "Removed from Favorites",
        description: favorite?.name || "Station removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
      console.error("Failed to remove favorite:", error);
    },
  });

  const isFavorite = (stationUuid: string): boolean => {
    return localFavorites.some(f => f.stationuuid === stationUuid);
  };

  const addFavorite = (station: Station) => {
    if (!isFavorite(station.stationuuid)) {
      addFavoriteMutation.mutate(station);
    }
  };

  const removeFavorite = (stationUuid: string) => {
    if (isFavorite(stationUuid)) {
      removeFavoriteMutation.mutate(stationUuid);
    }
  };

  const value: FavoritesContextType = {
    favorites: localFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    isLoading: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
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
