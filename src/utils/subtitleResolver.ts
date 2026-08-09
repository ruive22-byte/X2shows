export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  kind: 'subtitles' | 'captions';
  isDefault?: boolean;
}

export class SubtitleResolver {
  public static getTracksForShow(mediaType: 'movie' | 'tv' = 'tv'): SubtitleTrack[] {
    return [
      { id: 'en-cc', label: 'English [CC]', language: 'en', kind: 'captions', isDefault: true },
      { id: 'ja-sub', label: 'Japanese [Original Sub]', language: 'ja', kind: 'subtitles' },
      { id: 'es-sub', label: 'Spanish Subtitles', language: 'es', kind: 'subtitles' },
      { id: 'en-dub', label: 'English Dub Audio', language: 'en-dub', kind: 'subtitles' },
    ];
  }
}

export class CustomSubtitleLoader {
  /**
   * Reads a local user-dropped .vtt or .srt file and converts it into a ObjectURL for track injection
   */
  public static processLocalSubtitleFile(file: File): Promise<{ url: string; label: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        let content = e.target?.result as string;

        // Convert raw .srt content to WebVTT format if needed
        if (file.name.endsWith('.srt')) {
          content = 'WEBVTT\n\n' + content.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2');
        }

        const blob = new Blob([content], { type: 'text/vtt' });
        const objectUrl = URL.createObjectURL(blob);
        resolve({ url: objectUrl, label: `Custom: ${file.name}` });
      };

      reader.onerror = () => reject('Failed to read subtitle file');
      reader.readAsText(file);
    });
  }
}

