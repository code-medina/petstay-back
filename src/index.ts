//modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//custom modules
import { logger } from './lib/logger.js';

//routes
import { authRouter } from './routes/auth.routes.js';
import { connectionDB } from './db/connection.js';
import { estateRouter } from './routes/estate.routes.js';

const port = Number(process.env.PORT_API || 8888);
//cors
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.KEY_COOKIE!));
//route
app.get('/', (req, res) => {
  res.json({
    message: 'server is live',
    time: new Date().toISOString(),
  });
});
// routes
// logger body
app.use((req, res, next) => {
  logger.info('----body-----');
  logger.info(req.body);
  logger.info('----method-----');
  logger.info(req.method);
  logger.info('---url----');
  logger.info(req.url);

  next();
});

app.use('/api/v1', authRouter);
app.use('/api/v1', estateRouter);

//db
const main = async () => {
  try {
    await connectionDB();
    app.listen(port, () => {
      logger.info(`server run on port ${port}`);
    });
  } catch (error) {
    logger.error(error);
  }
};
await main();
