import mongoose, { Mongoose } from 'mongoose';
import { logger } from '../lib/logger.js';
let connection: null | Mongoose = null;

export const connectionDB = async () => {
  const uri = process.env.URL_DB || '';
  if (connection) disconnectDB();
  try {
    connection = await mongoose.connect(uri);
    
    //await mongoose.connection.db?.dropCollection('users');
    logger.info('successfull connection');
  } catch (error) {
    logger.error(error);

    throw new Error('Error connection db', { cause: error });
  }
};
export const disconnectDB = () => {
  logger.info('disconnecting...');
  if (connection) connection.disconnect();
};
