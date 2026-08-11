import { TmdbAnimatedShow } from '../../data/tmdbData';
import { EpisodeResolver, EpisodeResolution } from './EpisodeResolver';
import { ImageResolver } from './ImageResolver';
import { StreamResolver, StreamCandidate } from './StreamResolver';
import { ContentIdentityValidator } from './ContentIdentityValidator';

export interface OrchestratedMedia {
  resolution: EpisodeResolution;
  image: string;
  streamCandidates: StreamCandidate[];
}

export class MediaOrchestrator {
  public static async resolveMedia(
    show: TmdbAnimatedShow,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<OrchestratedMedia> {
    
    // 1. Resolve Exact Episode and Validate Identity
    const resolution = await EpisodeResolver.resolveEpisode(show, seasonNumber, episodeNumber);
    
    if (!resolution.success) {
      console.warn('MediaOrchestrator: Resolution failed or identity mismatch.', resolution);
    }

    // 2. Resolve Artwork (fallback hierarchy to avoid wrong artwork)
    const image = ImageResolver.getEpisodeImage(
      show,
      seasonNumber,
      episodeNumber,
      resolution.metadata?.stillUrl
    );

    // 3. Resolve Stream Candidates
    const candidates = await StreamResolver.getCandidates(show, seasonNumber, episodeNumber);

    return {
      resolution,
      image,
      streamCandidates: candidates
    };
  }
}
