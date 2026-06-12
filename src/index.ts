import 'dotenv/config';
import pino from 'pino';
import { createServer } from './api/server.js';

const logger = pino({ name: 'launchpulse' });
const port = Number(process.env.PORT ?? 3000);

const app = createServer();

app.listen(port, () => {
  logger.info({ port }, 'LaunchPulse API listening');
});
