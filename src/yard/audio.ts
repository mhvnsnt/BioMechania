export class YardAudio {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  muted = false;

  start() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 46;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    this.ctx = ctx;
    this.osc = osc;
    this.gain = gain;
    void ctx.resume();
  }

  setSpeed(speed: number, max: number, boosting: boolean) {
    if (!this.ctx || !this.osc || !this.gain || this.muted) {
      if (this.gain && this.muted) this.gain.gain.value = 0;
      return;
    }
    const t = this.ctx.currentTime;
    const norm = Math.min(1, Math.abs(speed) / Math.max(8, max));
    this.osc.frequency.setTargetAtTime(42 + norm * 78 + (boosting ? 24 : 0), t, 0.08);
    this.gain.gain.setTargetAtTime(norm > 0.04 ? 0.018 + norm * 0.02 : 0.0001, t, 0.08);
  }

  blip(freq: number) {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  stop() {
    try {
      this.osc?.stop();
    } catch {
      /* already stopped */
    }
    void this.ctx?.close();
    this.ctx = null;
    this.osc = null;
    this.gain = null;
  }
}
