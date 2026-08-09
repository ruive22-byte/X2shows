export interface PlaybackSettings {
  autoPlay: boolean;
  autoNext: boolean;
  autoSkip: boolean;
  defaultSpeed: number;
  volumeBoost: number;
}

export class PlaybackStateHelper {
  private static STORAGE_KEY = 'fakeflix_playback_settings';

  public static getSettings(): PlaybackSettings {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaults();
    } catch {
      return this.getDefaults();
    }
  }

  public static updateSetting<K extends keyof PlaybackSettings>(key: K, value: PlaybackSettings[K]): PlaybackSettings {
    const current = this.getSettings();
    const updated = { ...current, [key]: value };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  private static getDefaults(): PlaybackSettings {
    return { autoPlay: true, autoNext: true, autoSkip: true, defaultSpeed: 1.0, volumeBoost: 100 };
  }
}
