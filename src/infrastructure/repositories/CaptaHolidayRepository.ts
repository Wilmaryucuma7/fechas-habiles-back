import { HolidayRepository } from '@/domain/repositories/HolidayRepository';
import { Holiday, HolidayEntity } from '@/domain/entities/Holiday';
import { HolidayFetchError } from '@/domain/entities/DomainError';
import { config } from '@/config';
import { holidayCache } from '@/shared/services/CacheService';

type HolidayApiResponse = string[];

export class CaptaHolidayRepository implements HolidayRepository {
  private readonly apiUrl = config.holidays.apiUrl;

  async getHolidays(): Promise<Holiday[]> {
    return holidayCache.getHolidays(async () => {
      return this.fetchHolidaysFromAPI();
    });
  }

  private async fetchHolidaysFromAPI(): Promise<Holiday[]> {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new HolidayFetchError(
          `Failed to fetch holidays: HTTP ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json() as HolidayApiResponse;
      
      if (!Array.isArray(data)) {
        throw new HolidayFetchError('Invalid response format: expected array');
      }

      return data.map((dateString: string) => {
        if (typeof dateString !== 'string') {
          throw new HolidayFetchError('Invalid holiday data: expected date string');
        }
        
        return new HolidayEntity(dateString);
      });

    } catch (error) {
      if (error instanceof HolidayFetchError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new HolidayFetchError(`Network error: ${error.message}`);
      }
      
      throw new HolidayFetchError('Unknown error occurred while fetching holidays');
    }
  }

  clearCache(): void {
    holidayCache.invalidateHolidays();
  }
}
