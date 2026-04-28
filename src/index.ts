//modules
import express from 'express';
import cors from 'cors';

//custom modules
import { logger } from './lib/logger.js';

const port = 8888;
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
const corsOptions: cors.CorsOptions = {
  origin: isProduction
    ? allowedOrigins
    : (origin, callback) => {
        if (!origin || origin === `http://localhost:${port}`) {
          callback(null, true);
        } else {
          callback(new Error('Access-Control-Not-Allow'));
        }
      },
  credentials: true,
};

const app = express();
//middleware
app.use(cors(corsOptions));

//route
app.get('/', (req, res) => {
  res.json({
    message: 'server is live',
    time: new Date().toISOString(),
  });
});

app.listen(8888, () => {
  logger.info('server run on port 8888');
});
