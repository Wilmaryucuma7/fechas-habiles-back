export interface TimeProvider {
  toZonedTime(date: Date, timeZone: string): Date;
  fromZonedTime(date: Date, timeZone: string): Date;
  now(): Date;
  formatDateKey(date: Date, timeZone?: string): string;
}
