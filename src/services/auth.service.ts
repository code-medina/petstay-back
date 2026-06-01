
//env
import {env} from "../config/env.schema.js"
//module
import ms from 'ms';
import mongoose from 'mongoose';
//dtos
import {
  LoginResponseUserDto,
  type CreateUserDtoType,
  type LoginUserDtoTYpe,
} from '../dtos/user.dto.js';
//custom mudule
import {
  checkPassword,
  checkRefresh,
  toHashPassword,
  toHashRefresh,
} from '../lib/hash.js';
import { generateRefreshToken, generateToken, getPayload } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';
//db model
import type { ISession } from '../models/session.model.js';
import { Session } from '../models/session.model.js';
import type { IAuthRepository } from '../repositories/auth.repository.js';
//error global
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

  //session obj
  private generateSession = async (
    userId: string,
  ): Promise<{
    access: string;
    refresh: string;
    session: SessionWithoutId;
  }> => {
    const access = generateToken(userId);
    const { refresh, jti } = generateRefreshToken(userId);

    //session with hash  in db
    const hash = await toHashRefresh(refresh);
    const objectId = new mongoose.Types.ObjectId(userId);
    const session: SessionWithoutId = {
      userId: objectId,
      jti,
      expiresAt: new Date(
        Date.now() + ms(env.JWT_REFRESH_EXPIRES as ms.StringValue),
      ),
      refreshHash: hash,
    };
    return { access, refresh, session };
  };
  //save session in db
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

    const { access, refresh, session } = await this.generateSession(
      userRegister._id.toString(),
    );

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

  logoutUser = async (refresh: string) => {
    try {
      const decode = getPayload(refresh);
      if (decode.jti) {
        return Session.deleteOne({ jti: decode.jti });
      }
    } catch (error) {
      logger.info('Error in delete session in db');
      logger.info(error);
    }
  };
  refreshToken = async (userId: string, jti: string, refreshToken: string) => {
    try {
      const sessionDB = await Session.findOneAndDelete({ userId: userId, jti });
      //const session=await Session.findOne({userId:userId,jti});
      if (!sessionDB) throw new AppError('Refresh not found', 400);
      //hash
      const isValid = await checkRefresh(refreshToken, sessionDB.refreshHash);
      if (!isValid) throw new AppError('Unauthorized', 400);

      const { refresh, access, session } = await this.generateSession(userId);
      await this.saveSession(session);
      return { refresh, access };
    } catch (error) {
      logger.info(error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed refresh token', 500);
    }
  };
}
