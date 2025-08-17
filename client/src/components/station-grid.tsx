import { Station } from "@shared/schema";
import { StationCard } from "@/components/station-card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useAudio } from "@/contexts/audio-context";

interface StationGridProps {
  stations: Station[];
  isLoading: boolean;
  isEmpty: boolean;
}

export function StationGrid({ stations, isLoading, isEmpty }: StationGridProps) {
  const { currentStation } = useAudio();

  if (isLoading) {
    return <LoadingSkeleton count={12} />;
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-radio text-slate-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold mb-2">No stations found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Try adjusting your search or filters to find radio stations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="station-grid">
      {stations.map((station) => (
        <StationCard
          key={station.stationuuid}
          station={station}
          isCurrentStation={currentStation?.stationuuid === station.stationuuid}
        />
      ))}
    </div>
  );
}
