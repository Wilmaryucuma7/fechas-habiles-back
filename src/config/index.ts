import { AppConfigSchema, type AppConfig } from '@/shared/schemas';

try {
  process.loadEnvFile();
} catch (error) {
  console.warn('Could not load .env file, using environment variables or defaults');
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

export const config: AppConfig = (() => {
  try {
    const validatedConfig = AppConfigSchema.parse(rawConfig);
    console.log('✅ Configuration validated successfully');
    return validatedConfig;
  } catch (error) {
    console.error('❌ Configuration validation failed:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.error('Raw config:', JSON.stringify(rawConfig, null, 2));
    process.exit(1);
  }
})();
