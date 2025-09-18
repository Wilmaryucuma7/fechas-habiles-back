import { WorkingDateService } from '@/domain/services/WorkingDateService';
import { WorkingDateQueryEntity, WorkingDateQuery } from '@/domain/entities/WorkingDateQuery';
import { WorkingDateResultEntity } from '@/domain/entities/WorkingDateResult';

export class CalculateWorkingDateUseCase {
  constructor(private readonly workingDateService: WorkingDateService) {}

  async execute(queryParams: WorkingDateQuery): Promise<WorkingDateResultEntity> {
    const query = new WorkingDateQueryEntity(queryParams);
    return this.workingDateService.calculateWorkingDate(query);
  }
}
