//modules
import express from 'express';
//custom modules
import { logger } from './lib/logger.js';

const app = express();

app.listen(8888, () => {
  logger.info('server run on port 8888');
});
