export interface WorkingDateQuery {
  days?: number | undefined;
  hours?: number | undefined;
  date?: string | undefined;
}

export class WorkingDateQueryEntity {
  public readonly days: number;
  public readonly hours: number;
  public readonly startDate: Date;

  constructor(query: WorkingDateQuery) {
    this.days = query.days ?? 0;
    this.hours = query.hours ?? 0;
    this.startDate = query.date ? new Date(query.date) : new Date();
  }
}
