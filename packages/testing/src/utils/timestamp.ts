const NANOSECONDS_PER_MILLISECOND = 1_000_000;

export const timestampUtils = {
  fromMillis(millis: number): string {
    const nanos = millis * NANOSECONDS_PER_MILLISECOND;
    return nanos.toString();
  },

  fromSeconds(seconds: number): string {
    const nanos = seconds * 1_000 * NANOSECONDS_PER_MILLISECOND;
    return nanos.toString();
  },

  fromDate(date: Date): string {
    return timestampUtils.fromMillis(date.getTime());
  },

  now(): string {
    return timestampUtils.fromDate(new Date());
  },

  addSeconds(timestamp: string, seconds: number): string {
    const nanos = BigInt(timestamp);
    const added = nanos + BigInt(seconds * 1_000 * NANOSECONDS_PER_MILLISECOND);
    return added.toString();
  },

  addMillis(timestamp: string, millis: number): string {
    const nanos = BigInt(timestamp);
    const added = nanos + BigInt(millis * NANOSECONDS_PER_MILLISECOND);
    return added.toString();
  },

  subtractSeconds(timestamp: string, seconds: number): string {
    const nanos = BigInt(timestamp);
    const subtracted = nanos - BigInt(seconds * 1_000 * NANOSECONDS_PER_MILLISECOND);
    return subtracted.toString();
  },

  toDate(timestamp: string): Date {
    const nanos = BigInt(timestamp);
    const millis = Number(nanos / BigInt(NANOSECONDS_PER_MILLISECOND));
    return new Date(millis);
  },

  compare(a: string, b: string): number {
    const nanosA = BigInt(a);
    const nanosB = BigInt(b);
    if (nanosA < nanosB) return -1;
    if (nanosA > nanosB) return 1;
    return 0;
  },

  equals(a: string, b: string): boolean {
    return timestampUtils.compare(a, b) === 0;
  },

  before(a: string, b: string): boolean {
    return timestampUtils.compare(a, b) < 0;
  },

  after(a: string, b: string): boolean {
    return timestampUtils.compare(a, b) > 0;
  },

  range(start: Date, end: Date): readonly string[] {
    const timestamps: string[] = [];
    const current = new Date(start);
    const endTime = end.getTime();

    while (current.getTime() <= endTime) {
      timestamps.push(timestampUtils.fromDate(current));
      current.setSeconds(current.getSeconds() + 2);
    }

    return timestamps;
  },
};
