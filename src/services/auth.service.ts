
//dtos
import {
  LoginResponseUserDto,
  type CreateUserDtoType,
  type LoginUserDtoTYpe,
} from '../dtos/user.dto.js';
//custom mudule
import {
  checkPassword,

  toHashPassword,

} from '../lib/hash.js';
//import { generateRefreshToken, generateToken, getPayload } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';
//db model
//import type { ISession } from '../models/session.model.js';
import { Session } from '../models/session.model.js';
import type { IAuthRepository } from '../repositories/auth.repository.js';
//error global
import { AppError } from '../errors/app.error.js';
import type { SessionService } from "./session.service.js";
import { getPayload } from '../lib/jwt.js';



export class AuthService {
  private repo: IAuthRepository;
  private serviceSession: SessionService;
  constructor(authRepository: IAuthRepository, service: SessionService) {
    this.repo = authRepository;
    this.serviceSession = service;
  }
  registerUser = async (user: CreateUserDtoType) => {
    const { password, ...rest } = user;
    try {
      const existUser = await this.repo.findByEmail(rest.email);
      if (existUser) throw new AppError('User already registered', 400);
      const hashPassword = await toHashPassword(password);
      const data = { ...rest, password: hashPassword };

      return await this.repo.save(data);
    } catch (error) {
      logger.error(error);
      if (error instanceof AppError) throw error;

      throw new AppError('Error Register user', 500);
    }
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


    try {
      const { access, refresh } = await this.serviceSession.saveSession(userRegister._id.toString());

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
    }
    catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error login user", 500);
    }
  }

  logoutUser = async (refresh: string) => {
    try {
      const decode = getPayload(refresh);
      if (decode.jti && decode.userId) {
        return await this.serviceSession.closeSession(decode.userId, decode.jti);

      }
      return null;
    } catch (error) {
      logger.info('Error in delete session in db');
      logger.info(error);
    }
  };
  refreshToken = async (userId: string, jti: string, refreshToken: string) => {
    try {

      const sessionRemoved = await this.serviceSession.closeSession(userId, jti);
      if (!sessionRemoved) throw new AppError("Session not found", 400);
      logger.info({ message: "session removed", sessionRemoved });

      const isValid = await this.serviceSession.checkRefreshWithSession(refreshToken, sessionRemoved);
      if (!isValid) throw new AppError("unauthorized. Refresh invalid", 401);

      const { refresh, access } = await this.serviceSession.saveSession(userId);

      return { refresh, access };
    } catch (error) {
      logger.info(error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed refresh token', 500);
    }
  };
}
