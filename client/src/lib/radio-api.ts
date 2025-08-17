import { Station, RadioBrowserResponse, SearchParams } from "@shared/schema";

const API_BASE = "";

export async function fetchStationsByCountry(
  country: string, 
  options: { limit?: number; offset?: number; order?: string } = {}
): Promise<Station[]> {
  const params = new URLSearchParams({
    limit: options.limit?.toString() || "50",
    offset: options.offset?.toString() || "0",
    order: options.order || "clickcount",
  });

  const response = await fetch(`${API_BASE}/api/stations/${encodeURIComponent(country)}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stations: ${response.statusText}`);
  }
  
  const data: RadioBrowserResponse = await response.json();
  
  if (!data.ok) {
    throw new Error(data.message || "Failed to fetch stations");
  }
  
  return data.data || [];
}

export async function searchStations(searchParams: SearchParams): Promise<Station[]> {
  const params = new URLSearchParams();
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE}/api/stations/search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  const data: RadioBrowserResponse = await response.json();
  
  if (!data.ok) {
    throw new Error(data.message || "Search failed");
  }
  
  return data.data || [];
}

export async function fetchTopStations(count: number = 50): Promise<Station[]> {
  const response = await fetch(`${API_BASE}/api/stations/top/${count}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch top stations: ${response.statusText}`);
  }
  
  const data: RadioBrowserResponse = await response.json();
  
  if (!data.ok) {
    throw new Error(data.message || "Failed to fetch top stations");
  }
  
  return data.data || [];
}

export async function fetchLanguages(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/languages`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch languages: ${response.statusText}`);
  }
  
  const data: RadioBrowserResponse = await response.json();
  
  if (!data.ok) {
    throw new Error(data.message || "Failed to fetch languages");
  }
  
  return data.data || [];
}

export async function fetchTags(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/tags`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }
  
  const data: RadioBrowserResponse = await response.json();
  
  if (!data.ok) {
    throw new Error(data.message || "Failed to fetch tags");
  }
  
  return data.data || [];
}
