import { WorkingHoursConfig } from '@/domain/services/WorkingHoursService';

/**
 * Configuration Port - Domain layer
 * Port for accessing configuration values needed by domain services.
 * This abstraction allows the domain to be independent of configuration details.
 */
export interface IConfigurationPort {
  /**
   * Gets the working hours configuration for the application
   * @returns WorkingHoursConfig object with timezone and hour settings
   */
  getWorkingHoursConfig(): WorkingHoursConfig;

  /**
   * Gets the holiday API configuration
   * @returns Object with API URL and cache timeout settings
   */
  getHolidayConfig(): {
    apiUrl: string;
    cacheTimeout: number;
  };
}