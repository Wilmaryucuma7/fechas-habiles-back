import { WorkingDateService } from '@/domain/services/WorkingDateService';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { CaptaHolidayRepository } from '@/infrastructure/repositories/CaptaHolidayRepository';
import { toZonedTime } from 'date-fns-tz';
import { getDay } from 'date-fns';

describe('WorkingDateService - Business Logic Tests', () => {
  let workingDateService: WorkingDateService;
  let mockHolidayRepository: jest.Mocked<CaptaHolidayRepository>;
  let workingHoursService: WorkingHoursService;

  beforeEach(() => {
    const mockHolidays = [
      { date: '2025-01-01', name: 'New Year', type: 'national' },
      { date: '2025-04-17', name: 'Holy Thursday', type: 'national' },
      { date: '2025-04-18', name: 'Good Friday', type: 'national' },
      { date: '2025-12-25', name: 'Christmas', type: 'national' }
    ];

    mockHolidayRepository = {
      getHolidays: jest.fn(),
      clearCache: jest.fn()
    } as any;
    
    // Mock with some holidays for 2025
    mockHolidayRepository.getHolidays.mockResolvedValue(mockHolidays);

    // Create working hours service with test configuration
    workingHoursService = new WorkingHoursService({
      timezone: 'America/Bogota',
      startHour: 8,
      endHour: 17,
      lunchStartHour: 12,
      lunchEndHour: 13,
    });

    workingDateService = new WorkingDateService(mockHolidayRepository, workingHoursService);
  });

  // Helper function to create dates in Colombia timezone
  const createColombiaDate = (year: number, month: number, day: number, hour: number, minute: number = 0): Date => {
    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    return toZonedTime(date, 'America/Bogota');
  };

  describe('Business Rules Validation', () => {
    it('should handle Friday 5:00 PM + 1 hour = Monday 9:00 AM', async () => {
      // Create Friday 5:00 PM (end of work day)
      const friday5pm = createColombiaDate(2025, 9, 19, 17, 0); // Sep 19, 2025 is a Friday
      
      const result = await workingDateService.calculateWorkingDate(0, 1, friday5pm);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // Should be Monday 9:00 AM Colombia time
      expect(getDay(resultColombia)).toBe(1); // Monday
      expect(resultColombia.getHours()).toBe(9);
      expect(resultColombia.getMinutes()).toBe(0);
    });

    it('should handle Saturday 2:00 PM + 1 hour = Monday 9:00 AM', async () => {
      const saturday2pm = createColombiaDate(2025, 9, 20, 14, 0); // Sep 20, 2025 is a Saturday
      
      const result = await workingDateService.calculateWorkingDate(0, 1, saturday2pm);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // Should be Monday 9:00 AM Colombia time
      expect(getDay(resultColombia)).toBe(1); // Monday
      expect(resultColombia.getHours()).toBe(9);
      expect(resultColombia.getMinutes()).toBe(0);
    });

    it('should handle 1 day + 3 hours from Tuesday 3:00 PM', async () => {
      const tuesday3pm = createColombiaDate(2025, 9, 16, 15, 0); // Sep 16, 2025 is a Tuesday
      
      const result = await workingDateService.calculateWorkingDate(1, 3, tuesday3pm);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // Logic: Tuesday 3:00 PM + 1 day = Wednesday 3:00 PM, then + 3 hours = Wednesday 6:00 PM
      // But 6:00 PM is after work hours, so it should be Thursday morning + remaining time
      // Actually: Wednesday 3:00 PM + 2 hours = Wednesday 5:00 PM (end of day), then Thursday 8:00 AM + 1 hour = 9:00 AM
      expect(getDay(resultColombia)).toBe(4); // Thursday
      expect(resultColombia.getHours()).toBe(9); // 9:00 AM
      expect(resultColombia.getMinutes()).toBe(0);
    });

    it('should handle 8 working hours from 8:00 AM (same day 5:00 PM)', async () => {
      const monday8am = createColombiaDate(2025, 9, 15, 8, 0); // Sep 15, 2025 is a Monday
      
      const result = await workingDateService.calculateWorkingDate(0, 8, monday8am);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // Should be same day 5:00 PM Colombia time (8 hours = full working day)
      expect(getDay(resultColombia)).toBe(1); // Still Monday
      expect(resultColombia.getHours()).toBe(17);
      expect(resultColombia.getMinutes()).toBe(0);
    });

    it('should handle lunch time correctly (3 hours from 11:00 AM)', async () => {
      const monday11am = createColombiaDate(2025, 9, 15, 11, 0);
      
      const result = await workingDateService.calculateWorkingDate(0, 3, monday11am);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // 11:00 AM + 1 hour = 12:00 (lunch), skip to 13:00, then +2 hours = 15:00
      expect(resultColombia.getHours()).toBe(15); // 3:00 PM
      expect(resultColombia.getMinutes()).toBe(0);
    });
  });

  describe('UTC Conversion Validation', () => {
    it('should return results in UTC format', async () => {
      const monday8am = createColombiaDate(2025, 9, 15, 8, 0);
      
      const result = await workingDateService.calculateWorkingDate(0, 1, monday8am);
      
      // Result should be a UTC date
      expect(result.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Colombia is UTC-5, so 9:00 AM Colombia = 14:00 UTC
      const resultColombia = toZonedTime(result, 'America/Bogota');
      expect(resultColombia.getHours()).toBe(9); // 9:00 AM Colombia
      expect(result.getUTCHours()).toBe(14); // 14:00 UTC
    });
  });

  describe('Weekend and Holiday Handling', () => {
    it('should skip weekends correctly', async () => {
      const friday4pm = createColombiaDate(2025, 9, 19, 16, 0); // Friday 4:00 PM
      
      const result = await workingDateService.calculateWorkingDate(1, 0, friday4pm);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // Should be Monday (skip weekend)
      expect(getDay(resultColombia)).toBe(1); // Monday
    });

    it('should skip holidays correctly', async () => {
      // Test with a date before a holiday
      const beforeHoliday = createColombiaDate(2025, 12, 24, 16, 0); // Dec 24, day before Christmas
      
      const result = await workingDateService.calculateWorkingDate(1, 0, beforeHoliday);
      const resultColombia = toZonedTime(result, 'America/Bogota');
      
      // Should skip Christmas (Dec 25) and go to Dec 26
      expect(resultColombia.getDate()).toBe(26);
      expect(resultColombia.getMonth()).toBe(11); // December (0-indexed)
    });
  });
});
