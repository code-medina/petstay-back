import { User, type IUser } from '../models/user.model.js';
import type { CreateUserDtoType } from '../dtos/user.dto.js';

import { logger } from '../lib/logger.js';

export interface IAuthRepository {
  save(user: CreateUserDtoType): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
}
export class AuthRepository implements IAuthRepository {
  async save(user: CreateUserDtoType): Promise<IUser> {
    logger.info(user);
    return await User.create(user);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    logger.info('find by email user');
    logger.info(email);
    const userFind = await User.findOne({ email: email });
    logger.info(userFind);
    return await User.findOne({ email: email }).lean();
  }
}
