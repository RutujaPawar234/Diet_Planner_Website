import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app from './app.js';

/**
 * Entry point: connect to MongoDB first, then start the HTTP server.
 * app.js only builds the Express app, which keeps it importable by tests.
 */
async function start() {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      console.log(`NutriPlan API running in ${env.nodeEnv} mode on port ${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

start();
