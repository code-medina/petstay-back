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

// to generateSession
type SessionWithoutId = Omit<ISession, '_id'>;

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
    return await Session.create(session);
  };
  loginUser = async (user: LoginUserDtoTYpe) => {
    const userRegister = await this.repo.findByEmail(user);
    if (!userRegister) throw new Error(' User Not Found ');

    const isValid = await checkPassword(user.password, userRegister.password);
    if (!isValid) throw new Error('Invalid credential');

    //jsonwebtoken
    /*   const accessToken = generateToken(userRegister);
    const refreshToken = generateRefreshToken(userRegister); */
    const { access, refresh, session } =
      await this.generateSession(userRegister);
    const dto = LoginResponseUserDto.safeParse({
      ...userRegister,
      _id: userRegister._id.toString(),
    });
    const save = await this.saveSession(session);
    logger.info(save);

    if (!dto.success) throw new Error('error user');
    return { user: dto.data, refreshToken: refresh, accessToken: access };
  };
}
