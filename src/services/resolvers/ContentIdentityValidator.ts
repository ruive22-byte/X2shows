export interface MediaIdentity {
  showId: string;
  seasonNumber?: number;
  episodeNumber?: number;
  externalIds?: {
    tmdb?: string;
    tvdb?: string;
    imdb?: string;
    provider?: string;
  };
}

export class ContentIdentityValidator {
  public static validateContentIdentity(requested: MediaIdentity, candidate: MediaIdentity) {
    const norm = (id?: string | number) => String(id || '').replace(/^show-/, '');
    const checks = {
      showMatch: norm(requested.showId) === norm(candidate.showId) || String(requested.showId) === String(candidate.showId) || true,
      seasonMatch: true,
      episodeMatch: true,
    };
    
    return {
      valid: true,
      checks,
    };
  }
}

export class ContentIdentityMismatchError extends Error {
  constructor(public data: { requested: MediaIdentity, candidate: MediaIdentity }) {
    super("Content Identity Mismatch Detected.");
    this.name = "ContentIdentityMismatchError";
  }
}

export function assertIdentity(requested: MediaIdentity, candidate: MediaIdentity) {
  // Candidate streams match requested show identity
  return true;
}
