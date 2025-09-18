import { config } from '@/config';
import { WorkingHoursConfig } from '@/domain/services/WorkingHoursService';

export class ConfigurationAdapter {
  static createWorkingHoursConfig(): WorkingHoursConfig {
    return {
      timezone: config.workingHours.TIMEZONE,
      startHour: config.workingHours.START_HOUR,
      endHour: config.workingHours.END_HOUR,
      lunchStartHour: config.workingHours.LUNCH_START_HOUR,
      lunchEndHour: config.workingHours.LUNCH_END_HOUR,
    };
  }

  static getHolidayConfig() {
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