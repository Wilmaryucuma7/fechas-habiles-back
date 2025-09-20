import { AppConfigSchema, type AppConfig } from '@/shared/schemas';

/**
 * Configuration loading and validation - Infrastructure layer
 * Centralizes all environment and configuration management
 */
class ConfigurationManager {
  private config: AppConfig | null = null;

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    try {
      // Try to load .env file (Node.js 20+)
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile();
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Could not load .env file, using environment variables or defaults');
      }
    }

    const rawConfig = {
      holidays: {
        apiUrl: process.env.HOLIDAYS_API_URL || 'https://content.capta.co/Recruitment/WorkingDays.json',
        cacheTimeout: parseInt(process.env.HOLIDAYS_CACHE_TIMEOUT || '86400000', 10),
      },
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      workingHours: {
        START_HOUR: parseFloat(process.env.WORK_START_HOUR || '8'),
        END_HOUR: parseFloat(process.env.WORK_END_HOUR || '17'),
        LUNCH_START_HOUR: parseFloat(process.env.LUNCH_START_HOUR || '12'),
        LUNCH_END_HOUR: parseFloat(process.env.LUNCH_END_HOUR || '13'),
        TIMEZONE: process.env.TIMEZONE || 'America/Bogota',
      }
    };

    try {
      this.config = AppConfigSchema.parse(rawConfig);
    } catch (error) {
      console.error('❌ Configuration validation failed:', error instanceof Error ? error.message : String(error));
      console.error('Raw config:', JSON.stringify(rawConfig, null, 2));
      process.exit(1);
    }
  }

  public getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config;
  }
}

export const configurationManager = new ConfigurationManager();
export const config = configurationManager.getConfig();