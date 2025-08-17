import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { favoriteStationSchema, type Station, type SearchParams } from "@shared/schema";
import { z } from "zod";

const RADIO_BROWSER_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info'
];

async function fetchFromRadioBrowser(endpoint: string, params: URLSearchParams = new URLSearchParams()): Promise<Station[]> {
  const errors: Error[] = [];
  
  for (const mirror of RADIO_BROWSER_MIRRORS) {
    try {
      const url = `${mirror}${endpoint}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RadioStreamApp/1.0',
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Stream proxy endpoint to handle CORS and HTTPS issues
  app.get('/api/stream/:stationId', async (req, res) => {
    try {
      const { stationId } = req.params;
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ 
          ok: false, 
          message: 'Stream URL is required' 
        });
      }

      // Set appropriate headers for audio streaming
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Accept-Ranges', 'bytes');

      // Create fetch request with appropriate headers
      const streamResponse = await fetch(decodeURIComponent(url), {
        headers: {
          'User-Agent': 'ShonoWave/1.0 (Radio Stream App)',
          'Accept': 'audio/*,*/*;q=0.1',
          'Accept-Encoding': 'identity',
          'Connection': 'keep-alive',
          'Range': 'bytes=0-',
        },
        redirect: 'follow',
      });

      if (!streamResponse.ok) {
        return res.status(streamResponse.status).json({
          ok: false,
          message: `Stream unavailable: ${streamResponse.statusText}`
        });
      }

      // Copy response headers
      const contentType = streamResponse.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      // Stream the audio data using Node.js streams
      if (streamResponse.body) {
        const reader = streamResponse.body.getReader();
        
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              if (!res.write(value)) {
                // Backpressure handling
                await new Promise(resolve => res.once('drain', resolve));
              }
            }
            res.end();
          } catch (error) {
            console.error('Stream pump error:', error);
            reader.cancel();
            if (!res.destroyed) {
              res.destroy();
            }
          }
        };
        
        res.on('close', () => {
          reader.cancel();
        });
        
        pump();
      } else {
        res.status(500).json({ ok: false, message: 'No stream data available' });
      }

    } catch (error) {
      console.error('Stream proxy error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          ok: false, 
          message: error instanceof Error ? error.message : 'Stream proxy failed' 
        });
      }
    }
  });

  // Stream health check endpoint
  app.get('/api/stream/check/:stationId', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ 
          ok: false, 
          message: 'Stream URL is required' 
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const streamResponse = await fetch(decodeURIComponent(url), {
          method: 'HEAD',
          headers: {
            'User-Agent': 'ShonoWave/1.0 (Radio Stream App)',
            'Accept': 'audio/*,*/*;q=0.1',
          },
          signal: controller.signal,
          redirect: 'follow',
        });

        clearTimeout(timeoutId);

        const isHealthy = streamResponse.ok;
        const contentType = streamResponse.headers.get('content-type') || '';
        const isAudio = contentType.includes('audio') || contentType.includes('application/octet-stream');

        res.json({ 
          ok: true, 
          healthy: isHealthy && isAudio,
          status: streamResponse.status,
          contentType: contentType,
          message: isHealthy ? 'Stream is accessible' : `Stream returned ${streamResponse.status}`
        });

      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error) {
      console.error('Stream health check error:', error);
      res.json({ 
        ok: true, 
        healthy: false,
        message: error instanceof Error ? error.message : 'Stream health check failed' 
      });
    }
  });
  // Get stations by country
  app.get('/api/stations/:country', async (req, res) => {
    try {
      const { country } = req.params;
      const { limit = '50', offset = '0', order = 'clickcount' } = req.query;
      
      const params = new URLSearchParams({
        limit: limit as string,
        offset: offset as string,
        order: order as string,
        reverse: 'true',
        hidebroken: 'true',
      });
      
      const stations = await fetchFromRadioBrowser(`/json/stations/bycountry/${encodeURIComponent(country)}`, params);
      
      res.json({ ok: true, data: stations });
    } catch (error) {
      console.error('Error fetching stations:', error);
      res.status(500).json({ 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch stations' 
      });
    }
  });

  // Search stations
  app.get('/api/stations/search', async (req, res) => {
    try {
      const { 
        name, 
        country, 
        tag, 
        language, 
        limit = '50', 
        offset = '0', 
        order = 'clickcount' 
      } = req.query;
      
      const params = new URLSearchParams({
        limit: limit as string,
        offset: offset as string,
        order: order as string,
        reverse: 'true',
        hidebroken: 'true',
      });
      
      if (name) params.append('name', name as string);
      if (country) params.append('country', country as string);
      if (tag) params.append('tag', tag as string);
      if (language) params.append('language', language as string);
      
      const stations = await fetchFromRadioBrowser('/json/stations/search', params);
      
      res.json({ ok: true, data: stations });
    } catch (error) {
      console.error('Error searching stations:', error);
      res.status(500).json({ 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to search stations' 
      });
    }
  });

  // Get top stations
  app.get('/api/stations/top/:count', async (req, res) => {
    try {
      const { count } = req.params;
      const stations = await fetchFromRadioBrowser(`/json/stations/topclick/${count}`);
      
      res.json({ ok: true, data: stations });
    } catch (error) {
      console.error('Error fetching top stations:', error);
      res.status(500).json({ 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch top stations' 
      });
    }
  });

  // Get countries
  app.get('/api/countries', async (req, res) => {
    try {
      const response = await fetchFromRadioBrowser('/json/countries');
      res.json({ ok: true, data: response });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch countries' 
      });
    }
  });

  // Get languages
  app.get('/api/languages', async (req, res) => {
    try {
      const response = await fetchFromRadioBrowser('/json/languages');
      res.json({ ok: true, data: response });
    } catch (error) {
      console.error('Error fetching languages:', error);
      res.status(500).json({ 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch languages' 
      });
    }
  });

  // Get tags
  app.get('/api/tags', async (req, res) => {
    try {
      const response = await fetchFromRadioBrowser('/json/tags');
      res.json({ ok: true, data: response });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch tags' 
      });
    }
  });

  // Favorites endpoints
  app.get('/api/favorites', async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json({ ok: true, data: favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ 
        ok: false, 
        message: 'Failed to fetch favorites' 
      });
    }
  });

  app.post('/api/favorites', async (req, res) => {
    try {
      const validatedData = favoriteStationSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedData);
      res.json({ ok: true, data: favorite });
    } catch (error) {
      console.error('Error adding favorite:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          ok: false, 
          message: 'Invalid favorite data', 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          ok: false, 
          message: 'Failed to add favorite' 
        });
      }
    }
  });

  app.delete('/api/favorites/:stationUuid', async (req, res) => {
    try {
      const { stationUuid } = req.params;
      const removed = await storage.removeFavorite(stationUuid);
      
      if (removed) {
        res.json({ ok: true, message: 'Favorite removed' });
      } else {
        res.status(404).json({ ok: false, message: 'Favorite not found' });
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ 
        ok: false, 
        message: 'Failed to remove favorite' 
      });
    }
  });

  // Check if station is favorited
  app.get('/api/favorites/:stationUuid/check', async (req, res) => {
    try {
      const { stationUuid } = req.params;
      const isFavorite = await storage.isFavorite(stationUuid);
      res.json({ ok: true, data: { isFavorite } });
    } catch (error) {
      console.error('Error checking favorite:', error);
      res.status(500).json({ 
        ok: false, 
        message: 'Failed to check favorite status' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
