import { User, type IUser } from '../models/user.model.js';
import type { CreateUserDtoType } from '../dto/user.dto.js';

import { logger } from '../lib/logger.js';

export interface IAuthRepository {
  save(user: CreateUserDtoType): Promise<IUser>;
}
export class AuthRepository implements IAuthRepository {
  async save(user: CreateUserDtoType): Promise<IUser> {
    logger.info(user);
    return await User.create(user);
  }
}
