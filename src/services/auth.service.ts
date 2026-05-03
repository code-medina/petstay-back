import type { CreateUserDtoType } from '../dto/user.dto.js';
import { toHashPassword } from '../lib/hash.js';
import { logger } from '../lib/logger.js';
import type { IAuthRepository } from '../repositiries/auth.repository.js';

export class AuthService {
  private repo: IAuthRepository;
  constructor(authRepository: IAuthRepository) {
    this.repo = authRepository;
  }
  registerUser = async (user: CreateUserDtoType) => {
    const { password, ...rest } = user;
    const hashPassword = await toHashPassword(password);

    const data = { ...rest, password: hashPassword };
    logger.info('data :');
    logger.info(data);

    return this.repo.save(data);
  };
}
