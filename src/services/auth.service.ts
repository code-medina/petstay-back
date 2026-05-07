import type { CreateUserDtoType, LoginUserDtoTYpe } from '../dto/user.dto.js';
import { checkPassword, toHashPassword } from '../lib/hash.js';
import { generateRefreshToken, generateToken } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';
import type { IAuthRepository } from '../repositiries/auth.repository.js';

export class AuthService {
  private repo: IAuthRepository;
  constructor(authRepository: IAuthRepository) {
    this.repo = authRepository;
  }
  registerUser = async (user: CreateUserDtoType) => {
    const { password, ...rest } = user;
    const existUser = await this.repo.findByEmail({
      email: rest.email,
      password,
    });
    if (existUser) throw new Error('User already registered');
    const hashPassword = await toHashPassword(password);

    const data = { ...rest, password: hashPassword };
    logger.info('data :');
    logger.info(data);

    return this.repo.save(data);
  };
  loginUser = async (user: LoginUserDtoTYpe) => {
    const userRegister = await this.repo.findByEmail(user);
    if (!userRegister) throw new Error(' User Not Found ');

    const isValid = await checkPassword(user.password, userRegister.password);
    if (!isValid) throw new Error('Invalid credential');

    //jsonwebtoken
    const accessToken = generateToken(userRegister);
    const refreshToken = generateRefreshToken(userRegister);
    return { user: userRegister, refreshToken, accessToken };
  };
}
