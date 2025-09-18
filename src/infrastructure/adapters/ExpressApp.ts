import express, { Application, Request, Response } from 'express';
import { WorkingDateController } from '@/infrastructure/adapters/WorkingDateController';
import { CalculateWorkingDateUseCase } from '@/application/use-cases/CalculateWorkingDateUseCase';
import { WorkingDateService } from '@/domain/services/WorkingDateService';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { CaptaHolidayRepository } from '@/infrastructure/repositories/CaptaHolidayRepository';
import { ConfigurationAdapter } from '@/infrastructure/adapters/ConfigurationAdapter';
import { errorHandler, notFoundHandler } from '@/shared/middleware/ErrorHandling';

export class ExpressApp {
  private app: Application;
  private workingDateController!: WorkingDateController;

  constructor() {
    this.app = express();
    this.setupDependencies();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupDependencies(): void {
    const holidayRepository = new CaptaHolidayRepository();
    const workingHoursConfig = ConfigurationAdapter.createWorkingHoursConfig();
    const workingHoursService = new WorkingHoursService(workingHoursConfig);
    const workingDateService = new WorkingDateService(holidayRepository, workingHoursService);
    const calculateWorkingDateUseCase = new CalculateWorkingDateUseCase(workingDateService);
    this.workingDateController = new WorkingDateController(calculateWorkingDateUseCase);
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use((req: Request, res: Response, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/working-date', (req: Request, res: Response, next) => {
      this.workingDateController.calculate(req, res, next);
    });

    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  getApp(): Application {
    return this.app;
  }

  start(port?: number): void {
    const serverConfig = ConfigurationAdapter.getServerConfig();
    const actualPort = port ?? serverConfig.port;
    
    this.app.listen(actualPort, () => {
      console.log(`🚀 Server running on port ${actualPort}`);
      console.log(`📅 Working Date API: http://localhost:${actualPort}/working-date`);
    });
  }
}
