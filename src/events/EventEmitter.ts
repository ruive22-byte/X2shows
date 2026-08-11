export type EventMap = Record<string, any>;

export class EventEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: Array<(payload: T[K]) => void> } = {};

  public on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return () => this.off(event, listener);
  }

  public off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
  }

  public emit<K extends keyof T>(event: K, payload: T[K]): void {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach(listener => listener(payload));
  }
}

export interface AppEvents {
  EpisodeStarted: { showId: number; seasonNumber: number; episodeNumber: number };
  EpisodeProgressUpdated: { showId: number; seasonNumber: number; episodeNumber: number; currentTime: number; duration: number };
  EpisodeCompleted: { showId: number; seasonNumber: number; episodeNumber: number };
  PlaybackFailed: { showId: number; error: Error };
}

export const appEvents = new EventEmitter<AppEvents>();
