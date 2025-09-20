import { Holiday } from '@/domain/entities/Holiday';
import { config } from '@/infrastructure/config/ConfigurationManager';
import { ICacheService } from '@/shared/ports/ICacheService';

/**
 * Cache service for holidays - Shared layer
 * Implements caching with configurable timeout
 */
export class HolidayCacheService implements ICacheService {
  private holidaysCache: Holiday[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly cacheTimeout = config.holidays.cacheTimeout;

  async getHolidays(fetchFn: () => Promise<Holiday[]>): Promise<Holiday[]> {
    if (this.holidaysCache && this.cacheTimestamp && 
        Date.now() - this.cacheTimestamp < this.cacheTimeout) {
      return this.holidaysCache;
    }

    const holidays = await fetchFn();
    this.holidaysCache = holidays;
    this.cacheTimestamp = Date.now();
    
    return holidays;
  }

  invalidateHolidays(): void {
    this.holidaysCache = null;
    this.cacheTimestamp = null;
  }
}

export const holidayCache = new HolidayCacheService();
