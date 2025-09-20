import { WorkingHoursConfig } from '@/domain/services/WorkingHoursService';
import { IConfigurationPort } from '@/domain/ports/IConfigurationPort';
import { config } from '@/infrastructure/config/ConfigurationManager';

/**
 * Configuration Adapter - Infrastructure layer
 * Adapts external configuration to domain needs.
 * Implements the IConfigurationPort to provide configuration data to domain services.
 */
export class ConfigurationAdapter implements IConfigurationPort {
  getWorkingHoursConfig(): WorkingHoursConfig {
    return {
      timezone: config.workingHours.TIMEZONE,
      startHour: config.workingHours.START_HOUR,
      endHour: config.workingHours.END_HOUR,
      lunchStartHour: config.workingHours.LUNCH_START_HOUR,
      lunchEndHour: config.workingHours.LUNCH_END_HOUR,
    };
  }

  getHolidayConfig() {
    return {
      apiUrl: config.holidays.apiUrl,
      cacheTimeout: config.holidays.cacheTimeout,
    };
  }

  static getServerConfig() {
    return {
      port: config.port,
      nodeEnv: config.nodeEnv,
    };
  }
}