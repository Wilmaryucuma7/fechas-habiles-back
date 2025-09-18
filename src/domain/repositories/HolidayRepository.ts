import { Holiday } from '@/domain/entities/Holiday';

export interface HolidayRepository {
  getHolidays(): Promise<Holiday[]>;
}
