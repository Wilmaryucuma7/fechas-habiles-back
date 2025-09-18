import { HolidayEntity } from '@/domain/entities/Holiday';

describe('HolidayEntity', () => {
  describe('constructor', () => {
    it('should create a valid holiday entity', () => {
      const holiday = new HolidayEntity('2025-01-01');
      
      expect(holiday.date).toBe('2025-01-01');
    });

    it('should throw error for invalid date format', () => {
      expect(() => {
        new HolidayEntity('01-01-2025');
      }).toThrow('Invalid date format: 01-01-2025. Expected YYYY-MM-DD');
    });

    it('should throw error for invalid date', () => {
      expect(() => {
        new HolidayEntity('2025-13-01');
      }).toThrow('Invalid date: 2025-13-01');
    });
  });

  describe('equals', () => {
    it('should return true for equal holidays', () => {
      const holiday1 = new HolidayEntity('2025-01-01');
      const holiday2 = new HolidayEntity('2025-01-01');
      
      expect(holiday1.equals(holiday2)).toBe(true);
    });

    it('should return false for different holidays', () => {
      const holiday1 = new HolidayEntity('2025-01-01');
      const holiday2 = new HolidayEntity('2025-12-25');
      
      expect(holiday1.equals(holiday2)).toBe(false);
    });
  });

  describe('toDate', () => {
    it('should convert to Date object', () => {
      const holiday = new HolidayEntity('2025-01-01');
      const date = holiday.toDate();
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(1);
    });
  });
});
