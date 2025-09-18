export interface WorkingDateResult {
  date: string;
}

export class WorkingDateResultEntity {
  public readonly date: string;

  constructor(resultDate: Date) {
    this.date = resultDate.toISOString();
    
    if (!this.date.endsWith('Z')) {
      throw new Error('Result date must be in UTC format with Z suffix');
    }
  }

  toJSON(): WorkingDateResult {
    return {
      date: this.date
    };
  }
}
