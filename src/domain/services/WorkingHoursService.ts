export interface WorkingHoursConfig {
  readonly timezone: string;
  readonly startHour: number;
  readonly endHour: number;
  readonly lunchStartHour: number;
  readonly lunchEndHour: number;
}

export class WorkingHoursService {
  constructor(private readonly config: WorkingHoursConfig) {}

  public static readonly WORKING_DAYS = [1, 2, 3, 4, 5];
  
  isWorkingHour(hour: number): boolean {
    return (hour >= this.config.startHour && hour < this.config.lunchStartHour) ||
           (hour >= this.config.lunchEndHour && hour < this.config.endHour);
  }
  
  isWorkingDay(dayOfWeek: number): boolean {
    return WorkingHoursService.WORKING_DAYS.includes(dayOfWeek);
  }
  
  getWorkingHoursPerDay(): number {
    return (this.config.lunchStartHour - this.config.startHour) + 
           (this.config.endHour - this.config.lunchEndHour);
  }

  get timezone(): string {
    return this.config.timezone;
  }

  get startHour(): number {
    return this.config.startHour;
  }

  get endHour(): number {
    return this.config.endHour;
  }

  get lunchStartHour(): number {
    return this.config.lunchStartHour;
  }

  get lunchEndHour(): number {
    return this.config.lunchEndHour;
  }
}