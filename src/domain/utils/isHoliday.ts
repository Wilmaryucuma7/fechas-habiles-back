import { Holiday } from '@/domain/entities/Holiday';
import { TimeProvider } from '@/domain/ports/ITimeProvider';

/**
 * Domain utility function to check if a date is a holiday
 * Uses TimeProvider for consistent date formatting
 */
export function isHoliday(date: Date, holidays: Holiday[], timeProvider: TimeProvider): boolean {
  if (!date || isNaN(date.getTime())) return false;
  
  const key = timeProvider.formatDateKey(date);
  return holidays.some(h => h.date === key);
}
