import { CaptaHolidayRepository } from '@/infrastructure/repositories/CaptaHolidayRepository';
import { IHttpClient } from '@/shared/ports/IHttpClient';
import { ICacheService } from '@/shared/ports/ICacheService';

describe('CaptaHolidayRepository', () => {
  it('should fetch holidays and map to HolidayEntity', async () => {
    const fakeData = ['2025-01-01', '2025-12-25'];

    const mockHttpClient: IHttpClient = {
      get: jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => fakeData }) as any
    };

    const mockCache: ICacheService = {
      getHolidays: jest.fn(async (fn: any) => fn()),
      invalidateHolidays: jest.fn()
    } as any;

    const repo = new CaptaHolidayRepository('http://example.test', mockCache, mockHttpClient);
    const holidays = await repo.getHolidays();
  expect(holidays).toHaveLength(2);
  expect(holidays[0]).toBeDefined();
  expect(holidays[0]!.date).toBe('2025-01-01');
  });

  it('should throw HolidayFetchError on invalid format', async () => {
    const badData = { not: 'an array' };
    const mockHttpClient: IHttpClient = {
      get: jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => badData }) as any
    };

    const mockCache: ICacheService = {
      getHolidays: jest.fn(async (fn: any) => fn()),
      invalidateHolidays: jest.fn()
    } as any;

    const repo = new CaptaHolidayRepository('http://example.test', mockCache, mockHttpClient);
    await expect(repo.getHolidays()).rejects.toThrow();
  });
});
