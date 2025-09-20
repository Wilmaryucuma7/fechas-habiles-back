import { z } from 'zod';

/**
 * Schema for working date query validation
 * Ensures proper input validation for the API
 */
export const WorkingDateQuerySchema = z.object({
  days: z.coerce.number().int().min(0, "Days must be a positive integer").optional(),
  hours: z.coerce.number().int().min(0, "Hours must be a positive integer").optional(), 
  date: z.string().datetime().optional(),
}).refine(
  data => data.days !== undefined || data.hours !== undefined, 
  {
    message: "At least one of 'days' or 'hours' must be provided",
    path: ['days', 'hours']
  }
).refine(
  data => (data.days || 0) + (data.hours || 0) > 0,
  {
    message: "The sum of days and hours must be greater than 0",
    path: ['days', 'hours']
  }
);

/**
 * Schema for working hours configuration validation
 */
export const WorkingHoursConfigSchema = z.object({
  START_HOUR: z.number().min(0).max(23),
  END_HOUR: z.number().min(0).max(23), 
  LUNCH_START_HOUR: z.number().min(0).max(23),
  LUNCH_END_HOUR: z.number().min(0).max(23),
  TIMEZONE: z.string().min(1),
}).refine(
  data => data.START_HOUR < data.END_HOUR,
  {
    message: "START_HOUR must be less than END_HOUR",
    path: ['START_HOUR', 'END_HOUR']
  }
).refine(
  data => data.LUNCH_START_HOUR < data.LUNCH_END_HOUR,
  {
    message: "LUNCH_START_HOUR must be less than LUNCH_END_HOUR", 
    path: ['LUNCH_START_HOUR', 'LUNCH_END_HOUR']
  }
).refine(
  data => data.LUNCH_START_HOUR >= data.START_HOUR && data.LUNCH_END_HOUR <= data.END_HOUR,
  {
    message: "Lunch hours must be within working hours",
    path: ['LUNCH_START_HOUR', 'LUNCH_END_HOUR']
  }
);

/**
 * Schema for holidays configuration validation
 */
export const HolidaysConfigSchema = z.object({
  apiUrl: z.string().url("Invalid API URL format"),
  cacheTimeout: z.number().positive("Cache timeout must be positive")
});

/**
 * Main application configuration schema
 */
export const AppConfigSchema = z.object({
  workingHours: WorkingHoursConfigSchema,
  holidays: HolidaysConfigSchema,
  port: z.number().int().min(1000).max(65535).default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development')
});

export type WorkingHoursConfig = z.infer<typeof WorkingHoursConfigSchema>;
export type HolidaysConfig = z.infer<typeof HolidaysConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
