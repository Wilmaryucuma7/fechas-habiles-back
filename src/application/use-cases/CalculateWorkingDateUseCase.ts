import { WorkingDateService } from '@/domain/services/WorkingDateService';
import { WorkingDateQueryEntity, WorkingDateQuery } from '@/domain/entities/WorkingDateQuery';
import { WorkingDateResultEntity } from '@/domain/entities/WorkingDateResult';
import { ICalculateWorkingDateUseCase } from '@/application/ports/ICalculateWorkingDateUseCase';

export class CalculateWorkingDateUseCase implements ICalculateWorkingDateUseCase {
  constructor(private readonly workingDateService: WorkingDateService) {}

  async execute(queryParams: WorkingDateQuery): Promise<WorkingDateResultEntity> {
    const query = new WorkingDateQueryEntity(queryParams);
    return this.workingDateService.calculateWorkingDate(query);
  }
}
