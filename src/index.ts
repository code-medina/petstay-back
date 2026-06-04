//env
import { env } from "./config/env.schema.js";
//custom modules
import { logger } from './lib/logger.js';
import { connectionDB } from './db/connection.js';

import  app  from "./app.js";

//db
const main = async () => {
  try {
    await connectionDB();
    app.listen(env.PORT_API, () => {
      logger.info(`server run on port ${env.PORT_API}`);
    });
  } catch (error) {
    logger.error(error);
  }
};
await main();
