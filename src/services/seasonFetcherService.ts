import { TmdbAnimatedShow } from '../data/tmdbData';

const TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY || '379849c2e59542a503b3bcc3c6d8fcae';

export interface Episode {
  id: number;
  number: number;
  seasonNumber: number;
  title: string;
  overview: string;
  stillPath: string | null;
  stillUrl: string | null;
  airDate: string;
  voteAverage: number;
  runtimeMinutes?: number;
}

export interface SeasonDetails {
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  posterUrl: string | null;
  episodes: Episode[];
}

export class SeasonFetcherService {
  /**
   * Fetches the complete episode guide for a specific season of a show.
   */
  public static async fetchSeasonEpisodes(
    tmdbId: number,
    seasonNumber: number = 1
  ): Promise<Episode[]> {
    try {
      if (!tmdbId || isNaN(Number(tmdbId))) {
        return this.generateFallbackEpisodes(seasonNumber);
      }

      const url = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        return this.generateFallbackEpisodes(seasonNumber);
      }

      const data = await res.json();
      const rawEpisodes = data.episodes || [];

      if (rawEpisodes.length === 0) {
        return this.generateFallbackEpisodes(seasonNumber);
      }

      return rawEpisodes.map((ep: any) => ({
        id: ep.id || (seasonNumber * 100 + ep.episode_number),
        number: ep.episode_number,
        seasonNumber: ep.season_number || seasonNumber,
        title: ep.name || `Episode ${ep.episode_number}`,
        overview: ep.overview || 'Episode synopsis available in 4K Sakuga stream.',
        stillPath: ep.still_path,
        stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
        airDate: ep.air_date || '2024',
        voteAverage: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : 8.5,
        runtimeMinutes: ep.runtime || 24,
      }));
    } catch (err) {
      return this.generateFallbackEpisodes(seasonNumber);
    }
  }

  /**
   * Fetches all seasons and all episodes for a show in a single multi-fetch call.
   */
  public static async fetchAllSeasonsAndEpisodes(
    show: Partial<TmdbAnimatedShow>
  ): Promise<Record<number, Episode[]>> {
    const tmdbId = show.tmdbId || (show.id ? parseInt(String(show.id).replace(/\D/g, ''), 10) : 0);
    const totalSeasons = show.seasonCount || 1;
    const seasonMap: Record<number, Episode[]> = {};

    if (!tmdbId || isNaN(Number(tmdbId))) {
      seasonMap[1] = this.generateFallbackEpisodes(1);
      return seasonMap;
    }

    // Fetch all seasons in parallel
    const seasonPromises = Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
      async (sNum) => {
        const episodes = await this.fetchSeasonEpisodes(Number(tmdbId), sNum);
        return { sNum, episodes };
      }
    );

    const results = await Promise.all(seasonPromises);
    results.forEach(({ sNum, episodes }) => {
      seasonMap[sNum] = episodes;
    });

    return seasonMap;
  }

  /**
   * Fallback generator if offline or API key is missing.
   */
  public static generateFallbackEpisodes(seasonNumber: number): Episode[] {
    const episodeTitles = [
      'The Awakening & Quantum Rift',
      'Multiverse Kinetic Drift',
      'Canon Events Unbound',
      'Spider-Society Protocol',
      'Kinetic Sakuga Clash',
      'Dimension Glitch Matrix',
      'Venomous Overdrive Surge',
      'Across the Spatial Void',
      'The Final Reckoning',
      'Endgame Sakuga Climax',
      'Beyond Horizon Line',
      'Echoes of the Universe'
    ];

    return Array.from({ length: 12 }, (_, i) => ({
      id: seasonNumber * 1000 + i + 1,
      number: i + 1,
      seasonNumber,
      title: episodeTitles[i % episodeTitles.length],
      overview: 'High-octane animated key frame sequence rendered in 120 FPS Sakuga with spatial surround audio.',
      stillPath: null,
      stillUrl: null,
      airDate: '2024-01-01',
      voteAverage: 8.8,
      runtimeMinutes: 24,
    }));
  }
}
