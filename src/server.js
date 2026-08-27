import { createApp } from './app.js';
import { createDatabase } from './database.js';

const port = Number(process.env.PORT ?? 3000);
const databaseAvailable = process.env.DATABASE_AVAILABLE !== 'false';
const database = databaseAvailable
  ? createDatabase(process.env.DATABASE_URL ?? 'postgres://devopslab:devopslab@localhost:5432/devopslab')
  : null;
const app = createApp({ databaseAvailable, repository: database });

async function start() {
  if (database) {
    await database.initialize();
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DevOpsLab API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start DevOpsLab API:', error.message);
  process.exitCode = 1;
});
