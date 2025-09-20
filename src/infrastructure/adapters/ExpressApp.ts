import express, { Application, Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import { WorkingDateController } from '@/infrastructure/adapters/WorkingDateController';
import { errorHandler, notFoundHandler } from '@/shared/middleware/ErrorHandling';
import { ConfigurationAdapter } from '@/infrastructure/adapters/ConfigurationAdapter';
import { CompositionRoot } from '@/infrastructure/composition/CompositionRoot';

export class ExpressApp {
  private app: Application;
  private router: Router;
  private workingDateController: WorkingDateController;

  constructor(workingDateController?: WorkingDateController) {
    this.app = express();
    this.router = Router();
    
    // Use provided controller or create one using composition root
    this.workingDateController = workingDateController || CompositionRoot.getInstance().createWorkingDateController();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Express 5.1 compatible CORS configuration
    this.app.use(cors({
      origin: '*', // For tests, allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      credentials: false, // Set to false for wildcard origin
      optionsSuccessStatus: 200 // For legacy browser support and test compatibility
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // API routes - keep backward compatibility with existing tests
    this.router.get('/working-date', this.workingDateController.calculate.bind(this.workingDateController));

    // Mount router at root for backward compatibility, and also at /api/v1
    this.app.use('/', this.router);
    this.app.use('/api/v1', this.router);
    
    // Error handling middleware
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  getRouter(): Router {
    return this.router;
  }

  getApp(): Application {
    return this.app;
  }

  start(port?: number): void {
    const serverConfig = ConfigurationAdapter.getServerConfig();
    const actualPort = port ?? serverConfig.port;
    
    this.app.listen(actualPort, () => {
      console.log(`🚀 Server running on port ${actualPort}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}
