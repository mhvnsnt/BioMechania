/**
 * Keyboard state with edge detection. `isDown` is level-triggered; `wasPressed`
 * is edge-triggered and consumed once per frame via `endFrame()`, which is how
 * one-shot actions (enter/exit vehicle, toggle camera) avoid re-firing.
 */
export class Input {
  private down = new Set<string>();
  private justPressed = new Set<string>();
  /** Held keys injected by the QA probe. Not cleared on blur. */
  private forced = new Set<string>();

  constructor(target: Window = window) {
    target.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.down.add(e.code);
      this.justPressed.add(e.code);
      if (HANDLED.has(e.code)) e.preventDefault();
    });
    target.addEventListener('keyup', (e) => this.down.delete(e.code));
    target.addEventListener('blur', () => this.down.clear());
  }

  isDown(code: string): boolean {
    return this.down.has(code) || this.forced.has(code);
  }

  /** Replace the injected hold set. `[]` clears. Real keys still work. */
  force(codes: Iterable<string>): void {
    this.forced = new Set(codes);
  }

  wasPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  /** Returns -1, 0, or +1 from a pair of keys. */
  axis(negative: string[], positive: string[]): number {
    const neg = negative.some((c) => this.isDown(c)) ? 1 : 0;
    const pos = positive.some((c) => this.isDown(c)) ? 1 : 0;
    return pos - neg;
  }

  endFrame(): void {
    this.justPressed.clear();
  }
}

const HANDLED = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
]);
