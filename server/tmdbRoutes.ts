import type { Express, Request, Response } from 'express';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function validPositiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function mediaType(value: unknown): 'tv' | 'movie' | null {
  return value === 'tv' || value === 'movie' ? value : null;
}

async function tmdbFetch(path: string): Promise<globalThis.Response | null> {
  const apiKey = process.env.TMDB_API_KEY || process.env.TMDB_TOKEN;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey && !accessToken) return null;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const separator = path.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${path}${apiKey && !accessToken ? `${separator}api_key=${encodeURIComponent(apiKey)}` : ''}`;
  return fetch(url, { headers });
}

export function registerTmdbProviderRoutes(app: Express): void {
  app.get('/api/tmdb/:type/:id', async (req: Request, res: Response) => {
    const type = mediaType(req.params.type);
    const id = validPositiveInteger(req.params.id);
    const language = typeof req.query.language === 'string' ? req.query.language : 'en-US';
    if (!type || !id || !/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
      return res.status(400).json({ success: false, error: 'Invalid TMDB identity.' });
    }

    try {
      const response = await tmdbFetch(`/${type}/${id}?language=${encodeURIComponent(language)}`);
      if (!response) return res.status(503).json({ success: false, error: 'TMDB provider is not configured.' });
      if (!response.ok) return res.status(response.status).json({ success: false, error: 'TMDB provider request failed.' });
      return res.json(await response.json());
    } catch {
      return res.status(502).json({ success: false, error: 'TMDB provider is unavailable.' });
    }
  });

  app.get('/api/tmdb/tv/:id/season/:season', async (req: Request, res: Response) => {
    const id = validPositiveInteger(req.params.id);
    const season = validPositiveInteger(req.params.season);
    if (!id || !season) return res.status(400).json({ success: false, error: 'Invalid season identity.' });

    try {
      const response = await tmdbFetch(`/tv/${id}/season/${season}`);
      if (!response) return res.status(503).json({ success: false, error: 'TMDB provider is not configured.' });
      if (!response.ok) return res.status(response.status).json({ success: false, error: 'TMDB provider request failed.' });
      return res.json(await response.json());
    } catch {
      return res.status(502).json({ success: false, error: 'TMDB provider is unavailable.' });
    }
  });
  app.get('/api/tmdb/:type/:id/watch/providers', async (req: Request, res: Response) => {
    const type = mediaType(req.params.type);
    const id = validPositiveInteger(req.params.id);
    if (!type || !id) return res.status(400).json({ success: false, error: 'Invalid show identity.' });
    try {
      const response = await tmdbFetch(`/${type}/${id}/watch/providers`);
      if (!response) return res.status(503).json({ success: false, error: 'TMDB provider is not configured.' });
      if (!response.ok) return res.status(response.status).json({ success: false, error: 'TMDB provider request failed.' });
      return res.json(await response.json());
    } catch {
      return res.status(502).json({ success: false, error: 'TMDB provider is unavailable.' });
    }
  });
}
