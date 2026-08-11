export type PlaybackStatus =
  | 'idle'
  | 'resolving'
  | 'validating'
  | 'ready'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'failed'
  | 'fallback';

export interface PlaybackState {
  status: PlaybackStatus;
  serverId: string | null;
  streamUrl: string | null;
  error: Error | null;
}
