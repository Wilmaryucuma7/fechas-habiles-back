import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { 
  addDays,
  getDay, 
  getHours, 
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  subDays,
  isWeekend
} from 'date-fns';
import { HolidayRepository } from '@/domain/repositories/HolidayRepository';
import { Holiday } from '@/domain/entities/Holiday';
import { WorkingDateQueryEntity } from '@/domain/entities/WorkingDateQuery';
import { WorkingDateResultEntity } from '@/domain/entities/WorkingDateResult';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';

export class WorkingDateService {
  constructor(
    private readonly holidayRepository: HolidayRepository,
    private readonly workingHoursService: WorkingHoursService
  ) {}

  async calculateWorkingDate(query: WorkingDateQueryEntity): Promise<WorkingDateResultEntity>;
  async calculateWorkingDate(days: number, hours: number, startDate: Date): Promise<Date>;
  async calculateWorkingDate(
    queryOrDays: WorkingDateQueryEntity | number, 
    hours?: number, 
    startDate?: Date
  ): Promise<WorkingDateResultEntity | Date> {
    if (typeof queryOrDays === 'number' && typeof hours === 'number' && startDate instanceof Date) {
      const holidays = await this.holidayRepository.getHolidays();
      
      const startDateLocal = toZonedTime(startDate, this.workingHoursService.timezone);
      
      let workingDate = this.adjustToNearestWorkingTimeBackwards(startDateLocal, holidays);
      
      if (queryOrDays > 0) {
        workingDate = this.addWorkingDays(workingDate, queryOrDays, holidays);
      }
      
      
      if (hours > 0) {
        workingDate = this.addWorkingHours(workingDate, hours, holidays);
      }
      
      return fromZonedTime(workingDate, this.workingHoursService.timezone);
    }
    
    const query = queryOrDays as WorkingDateQueryEntity;
    const holidays = await this.holidayRepository.getHolidays();
    
    const startDateLocal = toZonedTime(query.startDate, this.workingHoursService.timezone);
    
    let workingDate = this.adjustToNearestWorkingTimeBackwards(startDateLocal, holidays);
    
    if (query.days > 0) {
      workingDate = this.addWorkingDays(workingDate, query.days, holidays);
    }
    
    if (query.hours > 0) {
      workingDate = this.addWorkingHours(workingDate, query.hours, holidays);
    }
    
    const utcResult = fromZonedTime(workingDate, this.workingHoursService.timezone);
    return new WorkingDateResultEntity(utcResult);
  }

  private adjustToNearestWorkingTimeBackwards(date: Date, holidays: Holiday[]): Date {
    let adjustedDate = new Date(date);

    if (isWeekend(adjustedDate)) {
      const dayOfWeek = getDay(adjustedDate);
      const daysToSubtract = dayOfWeek === 0 ? 2 : 1;
      adjustedDate = subDays(adjustedDate, daysToSubtract);
      adjustedDate = setHours(adjustedDate, this.workingHoursService.endHour);
      adjustedDate = setMinutes(adjustedDate, 0);
    }

    while (this.isHoliday(adjustedDate, holidays)) {
      adjustedDate = subDays(adjustedDate, 1);
      if (isWeekend(adjustedDate)) {
        const dayOfWeek = getDay(adjustedDate);
        const daysToSubtract = dayOfWeek === 0 ? 2 : 1;
        adjustedDate = subDays(adjustedDate, daysToSubtract);
      }
      adjustedDate = setHours(adjustedDate, this.workingHoursService.endHour);
      adjustedDate = setMinutes(adjustedDate, 0);
    }

    const hour = getHours(adjustedDate);
    const originalMinutes = adjustedDate.getMinutes();
    
    if (hour < this.workingHoursService.startHour) {
      adjustedDate = subDays(adjustedDate, 1);
      adjustedDate = setHours(adjustedDate, this.workingHoursService.endHour);
      adjustedDate = setMinutes(adjustedDate, 0);
      return this.adjustToNearestWorkingTimeBackwards(adjustedDate, holidays);
    } else if (hour >= this.workingHoursService.endHour) {
      adjustedDate = setHours(adjustedDate, this.workingHoursService.endHour);
      adjustedDate = setMinutes(adjustedDate, 0);
    } else if (hour >= this.workingHoursService.lunchStartHour && hour < this.workingHoursService.lunchEndHour) {
      adjustedDate = setHours(adjustedDate, this.workingHoursService.lunchStartHour);
      adjustedDate = setMinutes(adjustedDate, 0);
    } else {
      adjustedDate = setMinutes(adjustedDate, originalMinutes);
    }

    return this.setToExactTime(adjustedDate);
  }

  private addWorkingDays(startDate: Date, days: number, holidays: Holiday[]): Date {
    let currentDate = new Date(startDate);
    let remainingDays = days;

    while (remainingDays > 0) {
      currentDate = addDays(currentDate, 1);

      if (!isWeekend(currentDate) && !this.isHoliday(currentDate, holidays)) {
        remainingDays--;
      }
    }

    return currentDate;
  }

  private addWorkingHours(startDate: Date, hours: number, holidays: Holiday[]): Date {
    let currentDate = new Date(startDate);
    let remainingMinutes = Math.round(hours * 60);

    while (remainingMinutes > 0) {
      const currentHour = getHours(currentDate);
      const currentMinute = currentDate.getMinutes();

      if (currentHour >= this.workingHoursService.endHour) {
        currentDate = this.moveToNextWorkingDay(currentDate, holidays);
        currentDate = setHours(currentDate, this.workingHoursService.startHour);
        currentDate = setMinutes(currentDate, 0);
        continue;
      }

      if (currentHour >= this.workingHoursService.lunchStartHour && currentHour < this.workingHoursService.lunchEndHour) {
        currentDate = setHours(currentDate, this.workingHoursService.lunchEndHour);
        currentDate = setMinutes(currentDate, 0);
        continue;
      }

      let minutesUntilBreak: number;
      if (currentHour < this.workingHoursService.lunchStartHour) {
        minutesUntilBreak = (this.workingHoursService.lunchStartHour * 60) - (currentHour * 60 + currentMinute);
      } else {
        minutesUntilBreak = (this.workingHoursService.endHour * 60) - (currentHour * 60 + currentMinute);
      }

      const minutesToAdd = Math.min(remainingMinutes, minutesUntilBreak);
      currentDate = new Date(currentDate.getTime() + minutesToAdd * 60 * 1000);
      remainingMinutes -= minutesToAdd;

      if (getHours(currentDate) === this.workingHoursService.lunchStartHour && remainingMinutes > 0) {
        currentDate = setHours(currentDate, this.workingHoursService.lunchEndHour);
        currentDate = setMinutes(currentDate, 0);
      }
    }

    return this.setToExactTime(currentDate);
  }

  private moveToNextWorkingDay(date: Date, holidays: Holiday[]): Date {
    let nextDay = addDays(date, 1);

    while (isWeekend(nextDay) || this.isHoliday(nextDay, holidays)) {
      nextDay = addDays(nextDay, 1);
    }

    return nextDay;
  }

  private isHoliday(date: Date, holidays: Holiday[]): boolean {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    const dateString = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.date === dateString);
  }

  private setToExactTime(date: Date): Date {
    if (!date || isNaN(date.getTime())) {
      throw new Error('Invalid date provided to setToExactTime');
    }
    
    let result = setSeconds(date, 0);
    result = setMilliseconds(result, 0);
    return result;
  }
}
