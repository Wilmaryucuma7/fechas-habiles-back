import { WorkingDateController } from '@/infrastructure/adapters/WorkingDateController';

/**
 * Port for dependency injection container
 * Defines the contract for creating controllers in a hexagonal architecture
 */
export interface IDependencyContainer {
  createWorkingDateController(): WorkingDateController;
}