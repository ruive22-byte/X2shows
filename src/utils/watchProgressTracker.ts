export interface WatchProgress {
  showId: number | string;
  season: number;
  episode: number;
  timestampSeconds: number;
  durationSeconds: number;
  lastUpdated: number;
}

export class WatchProgressTracker {
  private static STORAGE_PREFIX = 'fakeflix_watch_progress_';

  /**
   * Saves or updates the current viewing state for a specific show
   */
  public static saveProgress(
    showId: number | string,
    season: number,
    episode: number,
    timestampSeconds: number = 0,
    durationSeconds: number = 0
  ): void {
    if (!showId) return;

    const key = `${this.STORAGE_PREFIX}${showId}`;
    const record: WatchProgress = {
      showId,
      season,
      episode,
      timestampSeconds: Math.floor(timestampSeconds),
      durationSeconds: Math.floor(durationSeconds),
      lastUpdated: Date.now(),
    };

    try {
      localStorage.setItem(key, JSON.stringify(record));
    } catch {
      // Graceful fallback if localStorage is full or restricted
    }
  }

  /**
   * Retrieves saved watch progress for a specific show
   */
  public static getProgress(showId: number | string): WatchProgress | null {
    if (!showId) return null;

    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${showId}`);
      if (!data) return null;
      return JSON.parse(data) as WatchProgress;
    } catch {
      return null;
    }
  }

  /**
   * Clears saved progress when an episode finishes or user resets tracking
   */
  public static clearProgress(showId: number | string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${showId}`);
    } catch {
      // Silent catch
    }
  }
}
