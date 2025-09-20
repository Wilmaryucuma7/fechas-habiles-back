import { HolidayRepository } from '@/domain/repositories/HolidayRepository';
import { Holiday } from '@/domain/entities/Holiday';
import { WorkingDateQueryEntity } from '@/domain/entities/WorkingDateQuery';
import { WorkingDateResultEntity } from '@/domain/entities/WorkingDateResult';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { TimeProvider } from '@/domain/ports/ITimeProvider';
import { WorkingDayCalculator } from '@/domain/services/WorkingDayCalculator';
import { WorkingHourCalculator } from '@/domain/services/WorkingHourCalculator';

/**
 * Domain service that orchestrates working date calculations
 * Core business logic for calculating working dates with days and hours
 */
export class WorkingDateService {
  constructor(
    private readonly holidayRepository: HolidayRepository,
    private readonly workingHoursService: WorkingHoursService,
    private readonly timeProvider: TimeProvider,
    private readonly dayCalculator: WorkingDayCalculator,
    private readonly hourCalculator: WorkingHourCalculator
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
      const startDateLocal = this.timeProvider.toZonedTime(startDate, this.workingHoursService.timezone);

      let workingDate = this.dayCalculator.moveToPreviousWorkingDay(startDateLocal);

      if (queryOrDays > 0) {
        workingDate = this.dayCalculator.addWorkingDays(workingDate, queryOrDays, holidays);
      }

      if (hours > 0) {
        workingDate = this.hourCalculator.addWorkingHours(workingDate, hours, holidays);
      }
      
      return this.timeProvider.fromZonedTime(workingDate, this.workingHoursService.timezone);
    }
    
    const query = queryOrDays as WorkingDateQueryEntity;
    const holidays = await this.holidayRepository.getHolidays();
    
    const startDateLocal = this.timeProvider.toZonedTime(query.startDate, this.workingHoursService.timezone);

    let workingDate = this.dayCalculator.moveToPreviousWorkingDay(startDateLocal);

    if (query.days > 0) {
      workingDate = this.dayCalculator.addWorkingDays(workingDate, query.days, holidays);
    }

    if (query.hours > 0) {
      workingDate = this.hourCalculator.addWorkingHours(workingDate, query.hours, holidays);
    }
    
    const utcResult = this.timeProvider.fromZonedTime(workingDate, this.workingHoursService.timezone);
    return new WorkingDateResultEntity(utcResult);
  }
}
