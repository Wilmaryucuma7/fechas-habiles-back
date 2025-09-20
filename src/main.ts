import { ExpressApp } from '@/infrastructure/adapters/ExpressApp';
import { CompositionRoot } from '@/infrastructure/composition/CompositionRoot';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Composition root - single responsibility
const compositionRoot = new CompositionRoot();
const workingDateController = compositionRoot.createWorkingDateController();

const app = new ExpressApp(workingDateController);
app.start(PORT);

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});
