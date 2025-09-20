import { HolidayRepository } from '@/domain/repositories/HolidayRepository';
import { Holiday, HolidayEntity } from '@/domain/entities/Holiday';
import { HolidayFetchError } from '@/domain/entities/DomainError';
import { ICacheService } from '@/shared/ports/ICacheService';
import { IHttpClient } from '@/shared/ports/IHttpClient';

type HolidayApiResponse = string[];

export class CaptaHolidayRepository implements HolidayRepository {
  constructor(
    private readonly apiUrl: string,
    private readonly cacheService: ICacheService,
    private readonly httpClient?: IHttpClient
  ) {}
 
  async getHolidays(): Promise<Holiday[]> {
    return this.cacheService.getHolidays(async () => {
      return this.fetchHolidaysFromAPI();
    });
  }

  private async fetchHolidaysFromAPI(): Promise<Holiday[]> {
    try {
      const rawResponse = this.httpClient ? await this.httpClient.get<HolidayApiResponse>(this.apiUrl) : await fetch(this.apiUrl);

      const ok = 'ok' in (rawResponse as any) ? (rawResponse as any).ok : false;
      const status = 'status' in (rawResponse as any) ? (rawResponse as any).status : 0;
      const statusText = ok ? '' : `HTTP ${status}`;

      if (!ok) {
        throw new HolidayFetchError(
          `Failed to fetch holidays: ${statusText}`
        );
      }

      const data = ('json' in (rawResponse as any) ? await (rawResponse as any).json() : []) as HolidayApiResponse;

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
    this.cacheService.invalidateHolidays();
  }
}
