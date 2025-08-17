import { z } from "zod";

export interface Station {
  stationuuid: string;
  name: string;
  country: string;
  language?: string;
  tags?: string;
  favicon?: string;
  url?: string;
  url_resolved?: string;
  codec?: string;
  bitrate?: number;
  homepage?: string;
  clickcount?: number;
  lastchangetime?: string;
}

export type CountryCode = string; // Support all countries

export interface Country {
  name: string;
  code: string;
  stationcount: number;
}

export interface Language {
  name: string;
  stationcount: number;
}

export interface FavoriteStation {
  stationuuid: string;
  name: string;
  favicon?: string;
  url_resolved?: string;
  country: string;
  tags?: string;
  bitrate?: number;
  addedAt: string;
}

export const favoriteStationSchema = z.object({
  stationuuid: z.string(),
  name: z.string(),
  favicon: z.string().optional(),
  url_resolved: z.string().optional(),
  country: z.string(),
  tags: z.string().optional(),
  bitrate: z.number().optional(),
  addedAt: z.string(),
});

export type InsertFavoriteStation = z.infer<typeof favoriteStationSchema>;

// API Response types
export interface RadioBrowserResponse {
  ok: boolean;
  message?: string;
  data?: Station[];
}

export interface SearchParams {
  country?: string;
  name?: string;
  tag?: string;
  language?: string;
  limit?: number;
  offset?: number;
  order?: 'name' | 'clickcount' | 'bitrate' | 'lastchangetime';
  reverse?: boolean;
}
