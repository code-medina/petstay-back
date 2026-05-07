import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { logger } from '../lib/logger.js';
import type { AuthService } from '../services/auth.service.js';
import {
  LoginUserDto,
  RegisterUserDto,
  type CreateUserDtoType,
  type RegisterUserDtoType,
} from '../dto/user.dto.js';

export class AuthController {
  private service: AuthService;
  constructor(authService: AuthService) {
    this.service = authService;
  }

  private addRole = (
    url: string,
    user: RegisterUserDtoType,
  ): CreateUserDtoType => {
    let role: 'tenant' | 'landlord' = 'tenant';

    logger.info(url.includes('landlord'));
    if (url.includes('landlord')) {
      role = 'landlord';
    }
    return { ...user, role };
  };
  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const dto = RegisterUserDto.safeParse(req.body);

    try {
      if (dto.success) {
        const user = this.addRole(req.originalUrl, dto.data);
        const data = await this.service.registerUser(user);
        return res
          .status(201)
          .json({ ok: true, message: 'successfull register', data });
      } else {
        throw new Error(dto.error.issues.map((m) => m.message).join('-'));
      }
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = LoginUserDto.safeParse(req.body);
      if (!dto.success)
        throw new Error(dto.error.issues.map((m) => m.message).join(' - '));

      const { user, accessToken, refreshToken } = await this.service.loginUser(
        dto.data,
      );

      const cookieOptionAccess: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //true for HTTPS,
        maxAge: 3600000, //1 hour,
        signed: true,
      };
      const cookieOptionRefresh: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //true for HTTPS,
        maxAge: 86400000, //1 day,
        signed: true,
      };
      res.cookie('access_token', accessToken, cookieOptionAccess);

      res.cookie('refresh_token', refreshToken, cookieOptionRefresh);

      const { password, favorites, estates, ...userSafe } = user;
      logger.info({ password, favorites, estates });

      //todo  set cookie
      return res.json({
        ok: true,
        message: 'successfull login',
        user: userSafe,
      });
    } catch (error) {
      next(error);
    }
  };
}
