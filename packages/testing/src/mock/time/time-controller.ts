export class TimeController {
  #currentTime: Date;
  #frozen: boolean;
  #offset: number;

  constructor() {
    this.#currentTime = new Date();
    this.#frozen = false;
    this.#offset = 0;
  }

  now(): Date {
    if (this.#frozen) {
      return new Date(this.#currentTime);
    }
    return new Date(Date.now() + this.#offset);
  }

  setTime(timestamp: Date): void {
    this.#currentTime = new Date(timestamp);
    this.#offset = timestamp.getTime() - Date.now();
    this.#frozen = false;
  }

  freeze(at?: Date): void {
    this.#currentTime = at ? new Date(at) : this.now();
    this.#frozen = true;
    this.#offset = this.#currentTime.getTime() - Date.now();
  }

  unfreeze(): void {
    this.#frozen = false;
  }

  advance(milliseconds: number): void {
    if (this.#frozen) {
      this.#currentTime = new Date(this.#currentTime.getTime() + milliseconds);
    } else {
      this.#offset += milliseconds;
    }
  }

  reset(): void {
    this.#currentTime = new Date();
    this.#frozen = false;
    this.#offset = 0;
  }

  get isFrozen(): boolean {
    return this.#frozen;
  }

  get offset(): number {
    return this.#offset;
  }
}

export function createTimeController(): TimeController {
  return new TimeController();
}
