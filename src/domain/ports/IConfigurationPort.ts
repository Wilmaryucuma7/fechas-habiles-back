import { WorkingHoursConfig } from '@/domain/services/WorkingHoursService';

export interface IConfigurationPort {
  getWorkingHoursConfig(): WorkingHoursConfig;
  getHolidayConfig(): {
    apiUrl: string;
    cacheTimeout: number;
  };
}