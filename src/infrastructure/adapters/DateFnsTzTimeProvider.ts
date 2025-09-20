import { TimeProvider } from '@/domain/ports/ITimeProvider';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, startOfDay as dfStartOfDay, endOfDay as dfEndOfDay } from 'date-fns';

export class DateFnsTzTimeProvider implements TimeProvider {
  toZonedTime(date: Date, timeZone: string): Date {
    return toZonedTime(date, timeZone);
  }

  fromZonedTime(date: Date, timeZone: string): Date {
    return fromZonedTime(date, timeZone);
  }

  now(): Date {
    return new Date();
  }

  formatDateKey(date: Date, timeZone = 'UTC'): string {
    const zoned = toZonedTime(date, timeZone);
    return format(zoned, 'yyyy-MM-dd');
  }

  startOfDay(date: Date, timeZone = 'UTC'): Date {
    const zoned = toZonedTime(date, timeZone);
    const start = dfStartOfDay(zoned);
    return fromZonedTime(start, timeZone);
  }

  endOfDay(date: Date, timeZone = 'UTC'): Date {
    const zoned = toZonedTime(date, timeZone);
    const end = dfEndOfDay(zoned);
    return fromZonedTime(end, timeZone);
  }
}
