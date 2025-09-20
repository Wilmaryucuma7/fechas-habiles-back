import { WorkingDateQuery } from '@/domain/entities/WorkingDateQuery';
import { WorkingDateResultEntity } from '@/domain/entities/WorkingDateResult';

export interface ICalculateWorkingDateUseCase {
  execute(query: WorkingDateQuery): Promise<WorkingDateResultEntity>;
}
