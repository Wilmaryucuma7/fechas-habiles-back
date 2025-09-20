import { addDays, getDay, subDays, isWeekend } from 'date-fns';
import { Holiday } from '@/domain/entities/Holiday';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { isHoliday } from '@/domain/utils/isHoliday';
import { TimeProvider } from '@/domain/ports/ITimeProvider';

export class WorkingDayCalculator {
  constructor(
    private readonly workingHoursService: WorkingHoursService, 
    private readonly timeProvider: TimeProvider
  ) {}

  moveToPreviousWorkingDay(date: Date, holidays: Holiday[]): Date {
    let adjusted = new Date(date);

    // Handle weekends first
    if (isWeekend(adjusted)) {
      const dayOfWeek = getDay(adjusted);
      const daysToSubtract = dayOfWeek === 0 ? 2 : 1;
      adjusted = subDays(adjusted, daysToSubtract);
      adjusted.setHours(this.workingHoursService.endHour, 0, 0, 0);
      return adjusted;
    }

    // Handle holidays
    while (isHoliday(adjusted, holidays, this.timeProvider)) {
      adjusted = subDays(adjusted, 1);
      // If we hit a weekend, handle it
      if (isWeekend(adjusted)) {
        const dayOfWeek = getDay(adjusted);
        const daysToSubtract = dayOfWeek === 0 ? 2 : 1;
        adjusted = subDays(adjusted, daysToSubtract);
      }
      adjusted.setHours(this.workingHoursService.endHour, 0, 0, 0);
    }

    // Handle times outside working hours
    const currentHour = adjusted.getHours();
    
    // If before working hours (before 8AM), move to previous day 5PM
    if (currentHour < this.workingHoursService.startHour) {
      adjusted = subDays(adjusted, 1);
      // Check if previous day is weekend/holiday and handle recursively
      if (isWeekend(adjusted) || isHoliday(adjusted, holidays, this.timeProvider)) {
        return this.moveToPreviousWorkingDay(adjusted, holidays);
      }
      adjusted.setHours(this.workingHoursService.endHour, 0, 0, 0);
      return adjusted;
    }
    
    // If after working hours (after 5PM), move to same day 5PM
    if (currentHour >= this.workingHoursService.endHour) {
      adjusted.setHours(this.workingHoursService.endHour, 0, 0, 0);
      return adjusted;
    }
    
    // If during lunch break (12PM-1PM), move back to 12PM
    if (currentHour >= this.workingHoursService.lunchStartHour && 
        currentHour < this.workingHoursService.lunchEndHour) {
      adjusted.setHours(this.workingHoursService.lunchStartHour, 0, 0, 0);
      return adjusted;
    }
    
    // If during working hours, keep as is
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
