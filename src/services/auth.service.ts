import ms from 'ms';
import {
  LoginResponseUserDto,
  type CreateUserDtoType,
  type LoginUserDtoTYpe,
} from '../dto/user.dto.js';
import { checkPassword, toHashPassword, toHashRefresh } from '../lib/hash.js';
import { generateRefreshToken, generateToken } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';
import type { ISession } from '../models/session.model.js';
import { Session } from '../models/session.model.js';
import type { IUser } from '../models/user.model.js';
import type { IAuthRepository } from '../repositiries/auth.repository.js';
import { AppError } from '../errors/app.error.js';

// to generateSession
type SessionWithoutId = Omit<ISession, '_id'>;

export class AuthService {
  private repo: IAuthRepository;
  constructor(authRepository: IAuthRepository) {
    this.repo = authRepository;
  }
  registerUser = async (user: CreateUserDtoType) => {
    const { password, ...rest } = user;
    const existUser = await this.repo.findByEmail(rest.email);
    if (existUser) throw new AppError('User already registered', 400);
    try {
      const hashPassword = await toHashPassword(password);
      const data = { ...rest, password: hashPassword };

      return this.repo.save(data);
    } catch (error) {
      logger.error(error);
      if (error instanceof AppError) throw error;

      throw new AppError('Error Register user', 500);
    }
  };

  //session
  private generateSession = async (
    user: IUser,
  ): Promise<{
    access: string;
    refresh: string;
    session: SessionWithoutId;
  }> => {
    const access = generateToken(user);
    const refresh = generateRefreshToken(user);
    const hash = await toHashRefresh(refresh);
    const session: SessionWithoutId = {
      userId: user._id,
      expiresAt: new Date(
        Date.now() + ms(process.env.JWT_REFRESH_EXPIRES as ms.StringValue),
      ),
      refreshHash: hash,
    };
    return { access, refresh, session };
  };
  private saveSession = async (session: SessionWithoutId) => {
    return Session.create(session);
  };

  loginUser = async (user: LoginUserDtoTYpe) => {
    const userRegister = await this.repo.findByEmail(user.email);

    if (!userRegister) {
      throw new AppError('User not found', 404);
    }

    const isValid = await checkPassword(user.password, userRegister.password);

    if (!isValid) {
      throw new AppError('Unauthorized', 401);
    }

    const { access, refresh, session } =
      await this.generateSession(userRegister);

    try {
      await this.saveSession(session);
    } catch (error) {
      logger.error(error);

      throw new AppError('Failed to save session', 500);
    }

    const dto = LoginResponseUserDto.safeParse({
      ...userRegister,
      _id: userRegister._id.toString(),
    });

    if (!dto.success) {
      logger.error(dto.error);

      throw new AppError('Invalid user data', 500);
    }

    return {
      user: dto.data,
      refreshToken: refresh,
      accessToken: access,
    };
  };
}
