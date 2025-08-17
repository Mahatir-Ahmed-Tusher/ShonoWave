import { type FavoriteStation, type InsertFavoriteStation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getFavorites(userId?: string): Promise<FavoriteStation[]>;
  addFavorite(favorite: InsertFavoriteStation, userId?: string): Promise<FavoriteStation>;
  removeFavorite(stationUuid: string, userId?: string): Promise<boolean>;
  isFavorite(stationUuid: string, userId?: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private favorites: Map<string, FavoriteStation[]>;

  constructor() {
    this.favorites = new Map();
  }

  async getFavorites(userId: string = 'default'): Promise<FavoriteStation[]> {
    return this.favorites.get(userId) || [];
  }

  async addFavorite(favorite: InsertFavoriteStation, userId: string = 'default'): Promise<FavoriteStation> {
    const userFavorites = this.favorites.get(userId) || [];
    
    // Check if already exists
    const existingIndex = userFavorites.findIndex(f => f.stationuuid === favorite.stationuuid);
    if (existingIndex >= 0) {
      return userFavorites[existingIndex];
    }

    const newFavorite: FavoriteStation = {
      ...favorite,
      addedAt: new Date().toISOString(),
    };

    userFavorites.push(newFavorite);
    this.favorites.set(userId, userFavorites);
    
    return newFavorite;
  }

  async removeFavorite(stationUuid: string, userId: string = 'default'): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    const index = userFavorites.findIndex(f => f.stationuuid === stationUuid);
    
    if (index >= 0) {
      userFavorites.splice(index, 1);
      this.favorites.set(userId, userFavorites);
      return true;
    }
    
    return false;
  }

  async isFavorite(stationUuid: string, userId: string = 'default'): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    return userFavorites.some(f => f.stationuuid === stationUuid);
  }
}

export const storage = new MemStorage();
