import { Request, Response, NextFunction } from 'express';
import { ICalculateWorkingDateUseCase } from '@/application/ports/ICalculateWorkingDateUseCase';
import { WorkingDateQuerySchema } from '@/shared/schemas';

export class WorkingDateController {
  constructor(private readonly calculateWorkingDateUseCase: ICalculateWorkingDateUseCase) {}

  async calculate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = WorkingDateQuerySchema.parse(req.query);
      const result = await this.calculateWorkingDateUseCase.execute(validatedQuery);
      res.status(200).json(result.toJSON());
    } catch (error) {
      next(error);
    }
  }
}
