// No synthesized audio: oscillator/AudioContext tone generation removed.
// Sound effect files (mp3/ogg) can be registered here later; all playback
// respects the persisted mute state and stays silent when muted.
const MUTE_KEY = 'soundMuted';

class SoundManager {
  private muted: boolean = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === 'true';
    } catch {}
  }

  public get isMuted(): boolean {
    return this.muted;
  }

  public setMuted(value: boolean) {
    this.muted = value;
    try {
      localStorage.setItem(MUTE_KEY, String(value));
    } catch {}
  }

  public toggle(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }
}

export const sounds = new SoundManager();
