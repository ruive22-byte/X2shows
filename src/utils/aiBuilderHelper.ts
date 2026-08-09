import { TmdbAnimatedShow } from '../data/tmdbData';
import { StreamServer, EMBED_SERVERS } from './serverResolver';
import { Episode } from '../services/seasonFetcherService';

/**
 * AI Builder Contract for Gemini
 * Defines the exact shape Gemini should return when generating UI or player components.
 */
export interface AiPlaybackContext {
  show: TmdbAnimatedShow;
  selectedServer: StreamServer;
  currentSeason: number;
  currentEpisode: number;
  availableEpisodes: Episode[];
  streamUrl: string;
}

export class AiBuilderHelper {
  /**
   * Generates a fully populated state object Gemini can use to initialize player components.
   */
  public static createPlaybackContext(
    show: TmdbAnimatedShow,
    serverId: string = 'server-1',
    season: number = 1,
    episode: number = 1,
    episodes: Episode[] = []
  ): AiPlaybackContext {
    const server = EMBED_SERVERS.find((s) => s.id === serverId) || EMBED_SERVERS[0];
    const isMovie = show.media_type === 'movie' || show.navType === 'Movies' || show.mediaType === 'movie';

    const streamUrl = isMovie
      ? server.getUrl(show)
      : server.getUrl(show, season, episode);

    return {
      show,
      selectedServer: server,
      currentSeason: season,
      currentEpisode: episode,
      availableEpisodes: episodes,
      streamUrl,
    };
  }

  /**
   * Formats a clean system context prompt that you can paste directly into Gemini to build new features fast.
   */
  public static getGeminiSystemPrompt(): string {
    return `
You are a React + TypeScript AI Developer building streaming components for an underground animated show app.

KEY INTERFACES:
- TmdbAnimatedShow (id, tmdbId, title, posterUrl, backdropUrl, media_type, seasonCount)
- StreamServer (id, name, badge, quality, getUrl(show, season, episode))
- Episode (number, seasonNumber, title, overview, stillUrl, runtimeMinutes)

UI STYLING RULES:
- TailWind CSS with dark cyberpunk arcade theme (#07151e, #0d2836, #00f2fe, #facc15).
- Heavy borders (border-2 border-black) with hard drop shadows (shadow-[4px_4px_0px_#000000]).
- Always handle loading states and missing fallbacks cleanly.
`;
  }
}
