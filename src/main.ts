import { ExpressApp } from '@/infrastructure/adapters/ExpressApp';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = new ExpressApp();
app.start(PORT);

process.on('SIGINT', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});
