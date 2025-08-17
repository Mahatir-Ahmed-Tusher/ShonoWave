import { AppHeader } from "@/components/app-header";
import { StationGrid } from "@/components/station-grid";
import { PlayerBar } from "@/components/player-bar";
import { FullPlayer } from "@/components/full-player";
import { useFavorites } from "@/contexts/favorites-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Station } from "@shared/schema";
import { Link } from "wouter";

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  // Convert favorites to station format for the grid
  const favoriteStations: Station[] = favorites.map(fav => ({
    stationuuid: fav.stationuuid,
    name: fav.name,
    country: fav.country,
    favicon: fav.favicon,
    url_resolved: fav.url_resolved,
    tags: fav.tags,
    bitrate: fav.bitrate,
  }));

  const handleClearAll = () => {
    if (favorites.length > 0 && confirm("Are you sure you want to remove all favorites?")) {
      favorites.forEach(fav => removeFavorite(fav.stationuuid));
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-dark-bg">
      <AppHeader />
      
      {/* Navigation */}
      <nav className="sticky top-16 z-30 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-slate-200 dark:border-dark-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              data-testid="link-back-home"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Stations
            </Link>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
            <div className="flex items-center gap-2 text-red-500">
              <i className="fas fa-heart"></i>
              <span className="font-medium">Your Favorites</span>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Favorites Header */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Favorites</h2>
            <p className="text-slate-500 dark:text-slate-400">
              {favorites.length} saved station{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {favorites.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
              data-testid="button-clear-favorites"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear All
            </Button>
          )}
        </div>
        
        <StationGrid
          stations={favoriteStations}
          isLoading={false}
          isEmpty={favorites.length === 0}
        />
        
        {/* Empty State for Favorites */}
        {favorites.length === 0 && (
          <div className="text-center py-12" data-testid="favorites-empty-state">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-heart text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              Start exploring radio stations and add your favorites by clicking the heart icon.
            </p>
            <Link href="/">
              <Button
                className="bg-bd-primary hover:bg-bd-primary/90 text-white"
                data-testid="button-explore-stations"
              >
                <i className="fas fa-radio mr-2"></i>
                Explore Stations
              </Button>
            </Link>
          </div>
        )}
      </section>
      
      <PlayerBar onOpenFullPlayer={() => setShowFullPlayer(true)} />
      
      <FullPlayer
        isOpen={showFullPlayer}
        onClose={() => setShowFullPlayer(false)}
      />
    </div>
  );
}
