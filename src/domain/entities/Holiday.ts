import { validateDateFormat } from '@/shared/utils/DateValidation';

export interface Holiday {
  readonly date: string;
}

export class HolidayEntity implements Holiday {
  constructor(
    public readonly date: string
  ) {
    validateDateFormat(date);
  }

  equals(other: Holiday): boolean {
    return this.date === other.date;
  }

  toDate(): Date {
    return new Date(this.date + 'T00:00:00');
  }
}
