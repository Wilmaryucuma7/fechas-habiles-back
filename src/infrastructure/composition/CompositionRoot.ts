import { ConfigurationAdapter } from '@/infrastructure/adapters/ConfigurationAdapter';
import { IConfigurationPort } from '@/domain/ports/IConfigurationPort';
import { CaptaHolidayRepository } from '@/infrastructure/repositories/CaptaHolidayRepository';
import { WorkingHoursService } from '@/domain/services/WorkingHoursService';
import { WorkingDateService } from '@/domain/services/WorkingDateService';
import { CalculateWorkingDateUseCase } from '@/application/use-cases/CalculateWorkingDateUseCase';
import { WorkingDateController } from '@/infrastructure/adapters/WorkingDateController';
import { holidayCache } from '@/shared/services/CacheService';
import { FetchHttpClient } from '@/shared/adapters/FetchHttpClient';
import { DateFnsTzTimeProvider } from '@/infrastructure/adapters/DateFnsTzTimeProvider';
import { WorkingDayCalculator } from '@/domain/services/WorkingDayCalculator';
import { WorkingHourCalculator } from '@/domain/services/WorkingHourCalculator';
import { IDependencyContainer } from '@/application/ports/IDependencyContainer';

export class CompositionRoot implements IDependencyContainer {
  private static instance: CompositionRoot;

  public static getInstance(): CompositionRoot {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new CompositionRoot();
    }
    return CompositionRoot.instance;
  }

  public createWorkingDateController(): WorkingDateController {
    const configurationPort: IConfigurationPort = new ConfigurationAdapter();
    
    const httpClient = new FetchHttpClient();
    const holidayRepo = new CaptaHolidayRepository(
      configurationPort.getHolidayConfig().apiUrl,
      holidayCache,
      httpClient
    );
    const timeProvider = new DateFnsTzTimeProvider();

    const workingHoursConfig = configurationPort.getWorkingHoursConfig();
    const workingHoursService = new WorkingHoursService(workingHoursConfig);
    const dayCalculator = new WorkingDayCalculator(workingHoursService, timeProvider);
    const hourCalculator = new WorkingHourCalculator(workingHoursService, timeProvider);
    const workingDateService = new WorkingDateService(
      holidayRepo,
      workingHoursService,
      timeProvider,
      dayCalculator,
      hourCalculator
    );

    const calculateWorkingDateUseCase = new CalculateWorkingDateUseCase(workingDateService);

    return new WorkingDateController(calculateWorkingDateUseCase);
  }

  public createCalculateWorkingDateUseCase(): CalculateWorkingDateUseCase {
    const configurationPort: IConfigurationPort = new ConfigurationAdapter();
    
    const httpClient = new FetchHttpClient();
    const holidayRepo = new CaptaHolidayRepository(
      configurationPort.getHolidayConfig().apiUrl,
      holidayCache,
      httpClient
    );
    const timeProvider = new DateFnsTzTimeProvider();

    const workingHoursConfig = configurationPort.getWorkingHoursConfig();
    const workingHoursService = new WorkingHoursService(workingHoursConfig);
    const dayCalculator = new WorkingDayCalculator(workingHoursService, timeProvider);
    const hourCalculator = new WorkingHourCalculator(workingHoursService, timeProvider);
    const workingDateService = new WorkingDateService(
      holidayRepo,
      workingHoursService,
      timeProvider,
      dayCalculator,
      hourCalculator
    );

    return new CalculateWorkingDateUseCase(workingDateService);
  }
}