import { addDays, getDay, subDays, isWeekend } from 'date-fns';
import { Holiday } from '@/domain/entities/Holiday';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { isHoliday } from '@/domain/utils/isHoliday';
import { TimeProvider } from '@/domain/ports/ITimeProvider';

/**
 * Domain service for working day calculations
 * Handles weekend and holiday logic
 */
export class WorkingDayCalculator {
  constructor(
    private readonly workingHoursService: WorkingHoursService, 
    private readonly timeProvider: TimeProvider
  ) {}

  moveToPreviousWorkingDay(date: Date): Date {
    let adjusted = new Date(date);

    if (isWeekend(adjusted)) {
      const dayOfWeek = getDay(adjusted);
      const daysToSubtract = dayOfWeek === 0 ? 2 : 1;
      adjusted = subDays(adjusted, daysToSubtract);
      adjusted.setHours(this.workingHoursService.endHour, 0, 0, 0);
    }

    return adjusted;
  }

  addWorkingDays(startDate: Date, days: number, holidays: Holiday[]): Date {
    let currentDate = new Date(startDate);
    let remaining = days;

    while (remaining > 0) {
      currentDate = addDays(currentDate, 1);
      if (!isWeekend(currentDate) && !isHoliday(currentDate, holidays, this.timeProvider)) {
        remaining--;
      }
    }

    return currentDate;
  }
}
