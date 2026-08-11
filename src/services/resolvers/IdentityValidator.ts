export interface EpisodeIdentity {
  showId: string;
  season: number;
  episode: number;
}

export class IdentityValidator {
  public static validateEpisodeIdentity(requested: EpisodeIdentity, resolved: EpisodeIdentity) {
    const checks = {
      showId: String(requested.showId) === String(resolved.showId),
      season: Number(requested.season) === Number(resolved.season),
      episode: Number(requested.episode) === Number(resolved.episode),
    };

    return {
      valid: Object.values(checks).every(Boolean),
      checks,
    };
  }

  public static strictStringMatch(expected: string, actual: string): boolean {
    if (!expected || !actual) return false;
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean(expected) === clean(actual);
  }
}
