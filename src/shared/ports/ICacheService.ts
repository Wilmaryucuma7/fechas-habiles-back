import { Holiday } from '@/domain/entities/Holiday';

export interface ICacheService {
  getHolidays(fetchFn: () => Promise<Holiday[]>): Promise<Holiday[]>;
  invalidateHolidays(): void;
}
