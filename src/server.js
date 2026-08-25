import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp({
  databaseAvailable: process.env.DATABASE_AVAILABLE !== 'false'
});

app.listen(port, '0.0.0.0', () => {
  console.log(`DevOpsLab API listening on port ${port}`);
});
