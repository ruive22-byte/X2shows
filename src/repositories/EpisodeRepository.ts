import { TmdbShowId, SeasonNumber, EpisodeNumber, createTmdbShowId, createSeasonNumber, createEpisodeNumber } from '../types/identifiers';
import { CanonicalEpisode } from '../services/validationPipeline';
import { Result } from '../services/validationPipeline';
import { SeasonFetcherService } from '../services/seasonFetcherService';

export interface IEpisodeRepository {
  getEpisode(showId: TmdbShowId, season: SeasonNumber, episode: EpisodeNumber): Promise<Result<CanonicalEpisode, Error>>;
  getSeasonEpisodes(showId: TmdbShowId, season: SeasonNumber): Promise<Result<CanonicalEpisode[], Error>>;
}

export class EpisodeRepository implements IEpisodeRepository {
  public async getSeasonEpisodes(showId: TmdbShowId, season: SeasonNumber): Promise<Result<CanonicalEpisode[], Error>> {
    try {
      const episodes = await SeasonFetcherService.fetchSeasonEpisodes(showId, season);
      return { success: true, data: episodes };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  public async getEpisode(showId: TmdbShowId, season: SeasonNumber, episode: EpisodeNumber): Promise<Result<CanonicalEpisode, Error>> {
    try {
      const episodesResult = await this.getSeasonEpisodes(showId, season);
      if (episodesResult.success) {
        const match = episodesResult.data.find(e => e.number === episode);
        if (!match) {
          return { success: false, error: new Error(`Episode ${episode} not found in season ${season}`) };
        }
        return { success: true, data: match };
      } else {
        return { success: false, error: (episodesResult as any).error };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }
}

export const episodeRepository = new EpisodeRepository();
