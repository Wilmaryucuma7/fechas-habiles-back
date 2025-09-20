import { addDays, getHours, setHours, setMinutes } from 'date-fns';
import { Holiday } from '@/domain/entities/Holiday';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { isHoliday } from '@/domain/utils/isHoliday';
import { TimeProvider } from '@/domain/ports/ITimeProvider';

/**
 * Domain service for working hour calculations
 * Handles hour-level calculations within working days
 */
export class WorkingHourCalculator {
  constructor(
    private readonly workingHoursService: WorkingHoursService, 
    private readonly timeProvider: TimeProvider
  ) {}

  moveToNextWorkingDay(date: Date, holidays: Holiday[]): Date {
    let next = addDays(date, 1);
    while (!this.workingHoursService.isWorkingDay(next.getDay()) || isHoliday(next, holidays, this.timeProvider)) {
      next = addDays(next, 1);
    }

    next = setHours(next, this.workingHoursService.startHour);
    next = setMinutes(next, 0);
    return next;
  }

  addWorkingHours(startDate: Date, hours: number, holidays: Holiday[]): Date {
    let current = new Date(startDate);
    let remainingMinutes = Math.round(hours * 60);

    while (remainingMinutes > 0) {
      const currentHour = getHours(current);
      const currentMinute = current.getMinutes();

      if (currentHour >= this.workingHoursService.endHour) {
        current = this.moveToNextWorkingDay(current, holidays);
        continue;
      }

      if (currentHour >= this.workingHoursService.lunchStartHour && currentHour < this.workingHoursService.lunchEndHour) {
        current = setHours(current, this.workingHoursService.lunchEndHour);
        current = setMinutes(current, 0);
        continue;
      }

      let minutesUntilBreak: number;
      if (currentHour < this.workingHoursService.lunchStartHour) {
        minutesUntilBreak = (this.workingHoursService.lunchStartHour * 60) - (currentHour * 60 + currentMinute);
      } else {
        minutesUntilBreak = (this.workingHoursService.endHour * 60) - (currentHour * 60 + currentMinute);
      }

      const minutesToAdd = Math.min(remainingMinutes, minutesUntilBreak);
      current = new Date(current.getTime() + minutesToAdd * 60 * 1000);
      remainingMinutes -= minutesToAdd;

      if (getHours(current) === this.workingHoursService.lunchStartHour && remainingMinutes > 0) {
        current = setHours(current, this.workingHoursService.lunchEndHour);
        current = setMinutes(current, 0);
      }
    }

    return current;
  }
}
