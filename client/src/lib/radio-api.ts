import { Station, RadioBrowserResponse, SearchParams } from "@shared/schema";

const RADIO_BROWSER_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info'
];

async function fetchFromRadioBrowser(endpoint: string, params: URLSearchParams = new URLSearchParams()): Promise<any[]> {
  const errors: Error[] = [];
  
  for (const mirror of RADIO_BROWSER_MIRRORS) {
    try {
      const url = `${mirror}${endpoint}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ShonoWave/1.0 (Radio Stream App)',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      errors.push(error as Error);
      continue;
    }
  }
  
  throw new Error(`All mirrors failed: ${errors.map(e => e.message).join(', ')}`);
}

export async function fetchStationsByCountry(
  country: string, 
  options: { limit?: number; offset?: number; order?: string } = {}
): Promise<Station[]> {
  const params = new URLSearchParams({
    limit: options.limit?.toString() || "50",
    offset: options.offset?.toString() || "0",
    order: options.order || "clickcount",
    reverse: "true",
    hidebroken: "true"
  });

  return await fetchFromRadioBrowser(`/json/stations/bycountry/${encodeURIComponent(country)}`, params);
}

export async function searchStations(searchParams: SearchParams): Promise<Station[]> {
  const params = new URLSearchParams({
    reverse: "true",
    hidebroken: "true"
  });
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  return await fetchFromRadioBrowser('/json/stations/search', params);
}

export async function fetchTopStations(count: number = 50): Promise<Station[]> {
  return await fetchFromRadioBrowser(`/json/stations/topclick/${count}`);
}

export async function fetchCountries(): Promise<any[]> {
  return await fetchFromRadioBrowser('/json/countries');
}

export async function fetchLanguages(): Promise<any[]> {
  return await fetchFromRadioBrowser('/json/languages');
}

export async function fetchTags(): Promise<any[]> {
  return await fetchFromRadioBrowser('/json/tags');
}
