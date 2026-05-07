import { User, type IUser } from '../models/user.model.js';
import type { CreateUserDtoType, LoginUserDtoTYpe } from '../dto/user.dto.js';

import { logger } from '../lib/logger.js';

export interface IAuthRepository {
  save(user: CreateUserDtoType): Promise<IUser>;
  findByEmail(user: LoginUserDtoTYpe): Promise<IUser | null>;
}
export class AuthRepository implements IAuthRepository {
  async save(user: CreateUserDtoType): Promise<IUser> {
    logger.info(user);
    return await User.create(user);
  }
  async findByEmail(user: LoginUserDtoTYpe): Promise<IUser | null> {
    logger.info('find by email user');
    logger.info(user);
    const userFind = await User.findOne({ email: user.email });
    logger.info(userFind);
    return await User.findOne({ email: user.email } ).lean();
  }
}
